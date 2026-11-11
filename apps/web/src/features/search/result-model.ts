import type { MealListing } from "@mealhrs/contracts";
export function categoryForSlug(slug:string){return slug==="soups"?"Soups":slug==="bakes"?"Bakery":slug==="rice"?"Rice":null;}
export function filterMealsByCategory(meals:readonly MealListing[],slug:string){const category=categoryForSlug(slug);return category?meals.filter(item=>item.dish.category===category):[];}
export function hasSearchMatches(result:Readonly<{dishes:readonly unknown[];vendors:readonly unknown[];posts:readonly unknown[]}>){return Boolean(result.dishes.length||result.vendors.length||result.posts.length);}
