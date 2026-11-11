export type AddressDraft = Readonly<{
  label: string;
  line1: string;
  area: "Ikotun" | "Ikeja";
  directions: string;
}>;

export function validateAddressDraft(draft: AddressDraft): string[] {
  return [
    ...(draft.label.trim().length < 2 ? ["Add a short address label."] : []),
    ...(draft.line1.trim().length < 8 ? ["Enter the full street address."] : []),
    ...(draft.area === "Ikeja" ? ["Choose a supported area before saving this delivery address."] : []),
  ];
}
