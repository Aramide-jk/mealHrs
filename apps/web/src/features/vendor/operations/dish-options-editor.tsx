"use client";

import { ngn, type DishOption, type DishOptionGroup } from "@mealhrs/domain";
import { Plus, Trash2 } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import styles from "./vendor-operations.module.css";

type PresetGroupId = "protein" | "portions" | "extras";

const groupConfigs: readonly {
  id: PresetGroupId;
  title: string;
  defaultGroupName: string;
  selection: "single" | "multiple";
  defaultRequired: boolean;
  addLabel: string;
  placeholder: string;
}[] = [
  {
    id: "protein",
    title: "Protein choices",
    defaultGroupName: "Choose your protein",
    selection: "single",
    defaultRequired: true,
    addLabel: "Add protein",
    placeholder: "e.g. Grilled chicken, Turkey, Fish",
  },
  {
    id: "extras",
    title: "Extras & sides",
    defaultGroupName: "Add something extra",
    selection: "multiple",
    defaultRequired: false,
    addLabel: "Add extra",
    placeholder: "e.g. Fried plantain, Extra rice, Coleslaw",
  },
  {
    id: "portions",
    title: "Portion options",
    defaultGroupName: "Choose portion",
    selection: "single",
    defaultRequired: false,
    addLabel: "Add portion",
    placeholder: "e.g. Regular, Large bowl",
  },
] as const;

export function normalizeOptionGroups(groups: readonly DishOptionGroup[]): DishOptionGroup[] {
  return groups
    .map((group) => ({
      ...group,
      choices: group.choices.filter((choice) => choice.name.trim().length > 0),
    }))
    .filter((group) => group.choices.length > 0);
}

export function DishOptionsEditor({
  groups,
  onChange,
}: Readonly<{
  groups: readonly DishOptionGroup[];
  onChange: (next: DishOptionGroup[]) => void;
}>) {
  const seq = useRef(1);

  const upsertGroup = (
    config: (typeof groupConfigs)[number],
    transform: (group: DishOptionGroup) => DishOptionGroup,
  ) => {
    const existing = groups.find((candidate) => candidate.id === config.id);
    const base: DishOptionGroup = existing ?? {
      id: config.id,
      name: config.defaultGroupName,
      required: config.defaultRequired,
      selection: config.selection,
      choices: [],
    };
    const updated = transform(base);
    const others = groups.filter((candidate) => candidate.id !== config.id);
    const next = updated.choices.length > 0 ? [...others, updated] : others;
    // Keep canonical ordering: protein, portions, extras, then any custom groups
    const order = new Map<string, number>([
      ["protein", 0],
      ["portions", 1],
      ["extras", 2],
    ]);
    next.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
    onChange(next);
  };

  const addChoice = (config: (typeof groupConfigs)[number]) => {
    const id = `${config.id}-${seq.current++}`;
    upsertGroup(config, (group) => ({
      ...group,
      choices: [
        ...group.choices,
        { id, name: "", priceDelta: ngn(0), available: true },
      ],
    }));
  };

  const updateChoice = (
    config: (typeof groupConfigs)[number],
    choiceId: string,
    patch: Partial<DishOption>,
  ) => {
    upsertGroup(config, (group) => ({
      ...group,
      choices: group.choices.map((choice) =>
        choice.id === choiceId ? { ...choice, ...patch } : choice,
      ),
    }));
  };

  const removeChoice = (config: (typeof groupConfigs)[number], choiceId: string) => {
    upsertGroup(config, (group) => ({
      ...group,
      choices: group.choices.filter((choice) => choice.id !== choiceId),
    }));
  };

  const toggleRequired = (config: (typeof groupConfigs)[number]) => {
    upsertGroup(config, (group) => ({
      ...group,
      required: !group.required,
    }));
  };

  return (
    <div className={styles.optionSections}>
      <div className="split">
        <span style={{ fontSize: "0.68rem", fontWeight: 600 }}>
          Proteins, portions &amp; extras
        </span>
        <span className="vendor-muted">Required vs optional choices</span>
      </div>

      {groupConfigs.map((config) => {
        const currentGroup = groups.find((candidate) => candidate.id === config.id);
        const choices = currentGroup?.choices ?? [];
        const required = currentGroup?.required ?? config.defaultRequired;

        return (
          <div className={styles.modifierCard} key={config.id}>
            <div className="split" style={{ flexWrap: "wrap", gap: 8 }}>
              <div>
                <strong style={{ fontSize: "0.72rem", display: "block" }}>{config.title}</strong>
                <span className="vendor-muted" style={{ fontSize: "0.62rem" }}>
                  {config.selection === "multiple"
                    ? "Optional · Customers can select multiple extras"
                    : required
                      ? "Required · Customer must pick one"
                      : "Optional · Single choice"}
                </span>
              </div>
              <div className="cluster">
                {config.selection === "single" && choices.length > 0 ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => toggleRequired(config)}
                  >
                    {required ? "Make optional" : "Make required"}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() => addChoice(config)}
                >
                  <Plus aria-hidden="true" size={13} />
                  {config.addLabel}
                </Button>
              </div>
            </div>

            {choices.length > 0 ? (
              <div className={styles.optionRows}>
                {choices.map((choice, index) => (
                  <div className={styles.optionBuilderRow} key={choice.id}>
                    <input
                      aria-label={`${config.title} option ${index + 1} name`}
                      placeholder={config.placeholder}
                      value={choice.name}
                      onChange={(event) =>
                        updateChoice(config, choice.id, { name: event.target.value })
                      }
                    />
                    <input
                      aria-label={`${config.title} option ${index + 1} extra price`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="+ ₦0"
                      value={choice.priceDelta.amount}
                      onChange={(event) => {
                        const raw = Number(event.target.value);
                        updateChoice(config, choice.id, {
                          priceDelta: ngn(Number.isFinite(raw) && raw >= 0 ? raw : 0),
                        });
                      }}
                    />
                    <Button
                      size="sm"
                      variant={choice.available ? "secondary" : "ghost"}
                      type="button"
                      onClick={() =>
                        updateChoice(config, choice.id, { available: !choice.available })
                      }
                    >
                      {choice.available ? "In stock" : "Out"}
                    </Button>
                    <button
                      type="button"
                      className={styles.optionRemove}
                      aria-label={`Remove ${choice.name || `${config.title} option ${index + 1}`}`}
                      onClick={() => removeChoice(config, choice.id)}
                    >
                      <Trash2 aria-hidden="true" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
