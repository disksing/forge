package serve

import (
	"context"
	"errors"
)

// GenerationLifecycleEffects is the narrow network/store adapter used after a
// plan has been committed as an operation receipt. Implementations must not
// hold a resource store or controller lock while invoking these callbacks.
// The callbacks return an observation that the caller must guard and commit
// before the next PlanGeneration call.
type GenerationLifecycleEffects struct {
	CreateGeneration        func(context.Context, GenerationLifecyclePlan) (agentHubSession, error)
	ObserveSession          func(context.Context, GenerationLifecyclePlan) (agentHubSession, error)
	DeliverMessage          func(context.Context, GenerationLifecyclePlan) (agentHubSession, error)
	InterruptTurn           func(context.Context, GenerationLifecyclePlan) (agentHubSession, error)
	StopSession             func(context.Context, GenerationLifecyclePlan) (agentHubSession, error)
	ResumeSession           func(context.Context, GenerationLifecyclePlan) (agentHubSession, error)
	ArchiveSession          func(context.Context, GenerationLifecyclePlan) (agentHubSession, error)
	RetireGeneration        func(context.Context, GenerationLifecyclePlan) error
	FinalizeArchivedMailbox func(context.Context, GenerationLifecyclePlan) error
}

// GenerationLifecycleExecutionResult is the network effect result. It is not
// a commit: callers must re-read facts and use GuardedLifecycleCommit before
// persisting the receipt or session observation.
type GenerationLifecycleExecutionResult struct {
	Plan    GenerationLifecyclePlan
	Receipt GenerationLifecycleReceipt
	Session *agentHubSession
}

// ExecuteGenerationLifecyclePlan runs exactly one planned effect. Waiting and
// no-op plans intentionally perform no callback. Network errors are recorded
// as unknown because the request may have reached AgentHub; local commit
// errors are retryable. This function has no lock or store access.
func ExecuteGenerationLifecyclePlan(ctx context.Context, plan GenerationLifecyclePlan, effects GenerationLifecycleEffects) (GenerationLifecycleExecutionResult, error) {
	if ctx == nil {
		ctx = context.Background()
	}
	result := GenerationLifecycleExecutionResult{
		Plan: plan,
		Receipt: GenerationLifecycleReceipt{
			Operation:    plan.Operation,
			State:        GenerationReceiptNone,
			OperationID:  plan.OperationID,
			GenerationID: plan.GenerationID,
			SessionID:    plan.SessionID,
			TurnID:       plan.TurnID,
			MessageID:    plan.MessageID,
			Revision:     plan.Guard.Revision,
		},
	}
	if plan.BlockedReason != "" {
		return result, errors.New(plan.BlockedReason)
	}
	var effectErr error
	switch plan.Operation {
	case GenerationOperationNone, GenerationOperationWaitForSession,
		GenerationOperationWaitForMessageReceipt, GenerationOperationWaitForTurnTerminal,
		GenerationOperationWaitForStopped:
		return result, nil
	case GenerationOperationCreateGeneration:
		result.Session, result.Receipt, effectErr = executeSessionEffect(ctx, plan, effects.CreateGeneration, result.Receipt)
	case GenerationOperationObserveSession:
		result.Session, result.Receipt, effectErr = executeSessionEffect(ctx, plan, effects.ObserveSession, result.Receipt)
	case GenerationOperationDeliverMessage:
		result.Session, result.Receipt, effectErr = executeSessionEffect(ctx, plan, effects.DeliverMessage, result.Receipt)
	case GenerationOperationInterruptTurn:
		result.Session, result.Receipt, effectErr = executeSessionEffect(ctx, plan, effects.InterruptTurn, result.Receipt)
	case GenerationOperationStopSession:
		result.Session, result.Receipt, effectErr = executeSessionEffect(ctx, plan, effects.StopSession, result.Receipt)
	case GenerationOperationResumeSession:
		result.Session, result.Receipt, effectErr = executeSessionEffect(ctx, plan, effects.ResumeSession, result.Receipt)
	case GenerationOperationArchiveSession:
		result.Session, result.Receipt, effectErr = executeSessionEffect(ctx, plan, effects.ArchiveSession, result.Receipt)
	case GenerationOperationRetireGeneration:
		if effects.RetireGeneration == nil {
			return result, errors.New("retire generation effect is unavailable")
		}
		if err := effects.RetireGeneration(ctx, plan); err != nil {
			result.Receipt.State = GenerationReceiptRetryable
			return result, err
		}
		result.Receipt.State = GenerationReceiptSucceeded
	case GenerationOperationFinalizeArchivedMailbox:
		if effects.FinalizeArchivedMailbox == nil {
			return result, errors.New("finalize archived mailbox effect is unavailable")
		}
		if err := effects.FinalizeArchivedMailbox(ctx, plan); err != nil {
			result.Receipt.State = GenerationReceiptRetryable
			return result, err
		}
		result.Receipt.State = GenerationReceiptSucceeded
	default:
		return result, errors.New("unknown generation lifecycle operation")
	}
	if effectErr != nil {
		return result, effectErr
	}
	return result, nil
}

func executeSessionEffect(ctx context.Context, plan GenerationLifecyclePlan, effect func(context.Context, GenerationLifecyclePlan) (agentHubSession, error), receipt GenerationLifecycleReceipt) (*agentHubSession, GenerationLifecycleReceipt, error) {
	if effect == nil {
		err := errors.New("generation lifecycle network effect is unavailable")
		receipt.State = GenerationReceiptRetryable
		return nil, receipt, err
	}
	session, err := effect(ctx, plan)
	if err != nil {
		receipt.State = GenerationReceiptUnknown
		return nil, receipt, err
	}
	receipt.State = GenerationReceiptSucceeded
	if session.ID == "" {
		return nil, receipt, nil
	}
	return &session, receipt, nil
}
