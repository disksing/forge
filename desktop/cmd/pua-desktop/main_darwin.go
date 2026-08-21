//go:build darwin

package main

import (
	"context"
	"fmt"
	"html"
	"os"
	"sync/atomic"
	"time"

	"github.com/disksing/pua/internal/desktop"
	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

func main() {
	options, err := desktop.DefaultOptions()
	if err != nil {
		fatal(err)
	}

	var window *application.WebviewWindow
	var result desktop.Result
	var backendErr error
	var quitInProgress atomic.Bool
	var quitApproved atomic.Bool
	var app *application.App
	app = application.New(application.Options{
		Name:        "PUA",
		Description: "PUA desktop application",
		ShouldQuit: func() bool {
			if quitApproved.Load() {
				return true
			}
			if backendErr != nil || !result.Managed {
				return true
			}
			if quitInProgress.CompareAndSwap(false, true) {
				go prepareQuit(app, window, options, result, &quitInProgress, &quitApproved)
			}
			return false
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: false,
		},
		SingleInstance: &application.SingleInstanceOptions{
			UniqueID: "com.disksing.pua.desktop",
			OnSecondInstanceLaunch: func(application.SecondInstanceData) {
				if window != nil {
					window.UnMinimise()
					window.Show()
					window.Focus()
				}
			},
			ExitCode: 0,
		},
	})
	ctx, cancel := context.WithTimeout(context.Background(), options.StartupTimeout+5*time.Second)
	result, backendErr = desktop.Ensure(ctx, options)
	cancel()

	windowOptions := application.WebviewWindowOptions{
		Name:      "main",
		Title:     "PUA",
		Width:     1440,
		Height:    900,
		MinWidth:  980,
		MinHeight: 640,
	}
	if backendErr == nil {
		windowOptions.URL = result.URL
	} else {
		windowOptions.HTML = errorPage(backendErr)
	}
	window = app.Window.NewWithOptions(windowOptions)
	window.RegisterHook(events.Common.WindowClosing, func(event *application.WindowEvent) {
		event.Cancel()
		window.Hide()
	})
	if err := app.Run(); err != nil {
		fatal(err)
	}
}

func prepareQuit(app *application.App, window *application.WebviewWindow, options desktop.Options, result desktop.Result, inProgress, approved *atomic.Bool) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	activeTurns, err := desktop.ActiveTurnCount(ctx, options, result)
	cancel()
	if err == nil && activeTurns == 0 {
		stopAndQuit(app, options, result, inProgress, approved)
		return
	}

	if window != nil {
		window.Show()
		window.Focus()
	}
	message := "PUA has active Agent work. You can keep the backend running in the background or stop it before quitting."
	if activeTurns > 1 {
		message = fmt.Sprintf("PUA has %d active Agent tasks. You can keep the backend running in the background or stop it before quitting.", activeTurns)
	} else if err != nil {
		message = "PUA could not confirm whether Agent work is active. Choose whether to keep the backend running or stop it before quitting."
	}
	dialog := app.Dialog.Question().SetTitle("Quit PUA?").SetMessage(message)
	dialog.AddButton("Keep Running").SetAsDefault().OnClick(func() {
		approved.Store(true)
		app.Quit()
	})
	dialog.AddButton("Stop and Quit").OnClick(func() {
		go stopAndQuit(app, options, result, inProgress, approved)
	})
	dialog.AddButton("Cancel").SetAsCancel().OnClick(func() {
		inProgress.Store(false)
	})
	dialog.Show()
}

func stopAndQuit(app *application.App, options desktop.Options, result desktop.Result, inProgress, approved *atomic.Bool) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	err := desktop.StopManaged(ctx, options, result)
	cancel()
	if err != nil {
		approved.Store(false)
		inProgress.Store(false)
		app.Dialog.Error().SetTitle("PUA could not stop").SetMessage(err.Error()).Show()
		return
	}
	approved.Store(true)
	app.Quit()
}

func errorPage(err error) string {
	return `<!doctype html><html><head><meta charset="utf-8"><title>PUA</title>` +
		`<style>body{margin:0;background:#f5f5f7;color:#1d1d1f;font:15px -apple-system,BlinkMacSystemFont,sans-serif}` +
		`main{max-width:680px;margin:12vh auto;padding:36px;background:white;border-radius:16px;box-shadow:0 8px 32px #0001}` +
		`h1{font-size:24px;margin-top:0}pre{white-space:pre-wrap;background:#f5f5f7;padding:16px;border-radius:10px}</style></head>` +
		`<body><main><h1>PUA backend could not start</h1><p>The desktop shell is running, but it could not connect to PUA.</p><pre>` +
		html.EscapeString(err.Error()) + `</pre><p>Quit and reopen PUA after resolving the error.</p></main></body></html>`
}

func fatal(err error) {
	_, _ = fmt.Fprintf(os.Stderr, "pua-desktop: %v\n", err)
	os.Exit(1)
}
