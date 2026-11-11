import { VendorContentView } from "@/features/vendor/operations/vendor-content-view";
import { repositories } from "@/lib/repositories";
import { notFound } from "next/navigation";

export default async function VendorContentPage() {
  const result = await repositories.vendor.getDashboard();
  if (!result.ok) notFound();
  return <VendorContentView contentDrafts={result.data.contentDrafts} menu={result.data.menu} posts={result.data.posts}/>;
}
