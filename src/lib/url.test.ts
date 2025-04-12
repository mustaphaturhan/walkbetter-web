import { buildUrl } from "./url";

describe("buildUrl", () => {
  it("creates a URL with full base + path + query", () => {
    const url = buildUrl("https://walkbetter.app", "/search", {
      q: "coffee",
      page: 2,
      active: true,
    });
    expect(url).toBe("https://walkbetter.app/search?q=coffee&page=2&active=true");
  });

  it("omits undefined or null params", () => {
    const url = buildUrl("https://walkbetter.app", "/test", {
      a: "1",
      b: undefined,
      c: null,
    });
    expect(url).toBe("https://walkbetter.app/test?a=1");
  });

  it("handles missing path", () => {
    const url = buildUrl("https://walkbetter.app", undefined, {
      hello: "world",
    });
    expect(url).toBe("https://walkbetter.app/?hello=world");
  });

  it("works with no params", () => {
    const url = buildUrl("https://walkbetter.app", "/foo");
    expect(url).toBe("https://walkbetter.app/foo");
  });

  it("returns base if nothing else is provided", () => {
    const url = buildUrl("https://walkbetter.app");
    expect(url).toBe("https://walkbetter.app/");
  });
});
