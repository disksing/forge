package app

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"testing/fstest"
)

func TestStandaloneHandlerUsesCanonicalBasePath(t *testing.T) {
	t.Setenv("AGENTHUB_HOME", t.TempDir())
	service, err := New(Options{
		Address: "127.0.0.1:4646",
		Version: "test",
		WebFS: fstest.MapFS{
			"index.html": {Data: []byte("<!doctype html><title>AgentHub test</title>")},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = service.Close() })

	server := httptest.NewServer(service.StandaloneHandler())
	t.Cleanup(server.Close)
	client := server.Client()
	client.CheckRedirect = func(_ *http.Request, _ []*http.Request) error { return http.ErrUseLastResponse }

	response, err := client.Get(server.URL + "/")
	if err != nil {
		t.Fatal(err)
	}
	response.Body.Close()
	if response.StatusCode != http.StatusTemporaryRedirect || response.Header.Get("Location") != BasePath+"/" {
		t.Fatalf("root response = %d Location %q", response.StatusCode, response.Header.Get("Location"))
	}

	response, err = client.Get(server.URL + "/v1/status")
	if err != nil {
		t.Fatal(err)
	}
	response.Body.Close()
	if response.StatusCode != http.StatusNotFound {
		t.Fatalf("legacy root API status = %d, want 404", response.StatusCode)
	}

	for _, path := range []string{BasePath + "/", BasePath + "/v1/status", BasePath + "/api.md"} {
		response, err = client.Get(server.URL + path)
		if err != nil {
			t.Fatal(err)
		}
		_, _ = io.Copy(io.Discard, response.Body)
		response.Body.Close()
		if response.StatusCode != http.StatusOK {
			t.Errorf("GET %s = %d, want 200", path, response.StatusCode)
		}
	}
}
