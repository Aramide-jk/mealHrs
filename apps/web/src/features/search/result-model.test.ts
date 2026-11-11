import { describe,expect,it } from "vitest";
import { filterMealsByCategory,hasSearchMatches } from "./result-model";
describe("search result model",()=>{it("returns an honest no-match state",()=>{expect(hasSearchMatches({dishes:[],vendors:[],posts:[]})).toBe(false);});it("does not show meals for an unknown category",()=>{expect(filterMealsByCategory([],"unknown")).toEqual([]);});});
