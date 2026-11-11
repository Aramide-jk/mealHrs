"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, MapPin, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCustomerContext } from "@/lib/customer-context";

export function ShellLocationDialog() {
  const { activeArea, availableAreas, setActiveArea } = useCustomerContext();
  const router = useRouter();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="location-control" type="button" aria-label={`Change delivery area. Currently ${activeArea.name}`}>
          <MapPin aria-hidden="true" size={16} />
          <span>Delivering to {activeArea.name}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="shell-dialog-overlay" />
        <Dialog.Content className="shell-dialog" aria-modal="true">
          <div className="shell-dialog-head">
            <div>
              <Dialog.Title>Choose delivery area</Dialog.Title>
              <Dialog.Description>Availability, delivery fees, cart and checkout depend on this area.</Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Close delivery area selector"><X aria-hidden="true" /></Dialog.Close>
          </div>
          <div className="shell-area-list">
            {availableAreas.map((area) => (
              <Dialog.Close asChild key={area.id}>
                <button className="shell-area-option" type="button" onClick={() => { setActiveArea(area); router.refresh(); }} aria-pressed={activeArea.id === area.id}>
                  <span><strong>{area.name}</strong><small>{area.state}</small></span>
                  {activeArea.id === area.id ? <Check aria-hidden="true" /> : null}
                </button>
              </Dialog.Close>
            ))}
          </div>
          <p className="shell-dialog-note">Selecting an unsupported area keeps food content visible but blocks delivery checkout.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
