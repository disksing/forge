package serve

// Legacy notification names are isolated here so the normal notification
// reconciler only has one current result type. Existing durable callbacks are
// translated in place; completed history is never scanned to manufacture a
// new operation.
const legacyCreatorTurnResultType = "creator_turn_result"

func normalizeLegacyNotificationType(value string) string {
	if value == legacyCreatorTurnResultType {
		return resourceMessageTypeTurnResult
	}
	return value
}

func normalizeLegacyMailboxMessage(message *resourceMailboxMessage) {
	message.Type = normalizeLegacyNotificationType(message.Type)
	if message.Causation != nil {
		message.Causation.Type = normalizeLegacyNotificationType(message.Causation.Type)
	}
	if message.Notification != nil {
		message.Notification.Type = normalizeLegacyNotificationType(message.Notification.Type)
	}
}

func normalizeLegacyMailboxOperation(operation *resourceMailboxNotificationOp) {
	operation.Type = normalizeLegacyNotificationType(operation.Type)
	if operation.GeneratedCausation != nil {
		operation.GeneratedCausation.Type = normalizeLegacyNotificationType(operation.GeneratedCausation.Type)
	}
}
