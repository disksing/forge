import { describe, expect, it } from "vitest";

import { parseAgentProfiles } from "../../src/controllers/create-dialog-controller";

describe("CreateDialogController", () => {
	it("normalizes and deduplicates preferred Agent profiles", () => {
		expect(parseAgentProfiles(" Build,review, BUILD, ,Review ")).toEqual(["build", "review"]);
	});
});
