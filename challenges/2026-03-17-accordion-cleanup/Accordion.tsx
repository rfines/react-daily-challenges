import React, { useCallback } from "react";
import { AccordionProvider, useAccordion } from "./AccordionContext";


// ⚠️ This component works but is messy. Refactor it!
// All tests must stay green.

export interface AccordionItemData {
  id: string;
  title: string;
  content: string;
}

export interface AccordionProps {
  items: AccordionItemData[];
  allowMultiple?: boolean;
}

export function AccordionItem(item: AccordionItemData) {
  const {openIds} = useAccordion();
  const {title, id, content} = item;
  const isOpen = openIds.includes(id);
  
  return (
    <div key={id} data-testid={`accordion-item-${id}`}>
     <AccordionTrigger
        title={title}
        id={id}
      />
      {isOpen && (
        <AccordionContent
          id={id}
          content={content}
        />
      )}
    </div>
  ) 
}
export function AccordionTrigger({title, id}: {title: string, id: string}) {
  const {openIds, toggleItem} = useAccordion();
  const onClick = useCallback(() => toggleItem(id), [toggleItem, id]);
  const isOpen = openIds.includes(id);
  return (
    <button
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        id={`trigger-${id}`}
        onClick={onClick}
        style={{
          width: "100%",
          padding: "12px 16px",
          textAlign: "left",
          background: "none",
          border: "1px solid #e2e8f0",
          borderBottom: isOpen ? "none" : "1px solid #e2e8f0",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{title}</span>
        <span
          aria-hidden="true"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          ▼
        </span>
      </button>
  )
}
export function AccordionContent({id, content}: {id: string, content: string}) {
  return (
    <div
      role="region"
      id={`panel-${id}`}
      aria-labelledby={`trigger-${id}`}
      style={{
        padding: "12px 16px",
        border: "1px solid #e2e8f0",
        borderTop: "none",
      }}
    >
      {content}
    </div>
  )
}
export function Accordion({items, allowMultiple}: AccordionProps) {
  
  return (
    <AccordionProvider allowMultiple={allowMultiple}>
    <div role="region" aria-label="Accordion">
      {items.map((item) => {
        return (
          <AccordionItem {...item} />
        );
      })}
    </div>
    </AccordionProvider>
  );
}

// ── Also exported: a standalone "FAQ" wrapper that duplicates even more ──

interface FaqProps {
  questions: { question: string; answer: string }[];
}

export function Faq({ questions }: FaqProps) {

  return (
    <div role="region" aria-label="FAQ">
      <Accordion items={questions.map((q) => ({ title: q.question, content: q.answer, id: q.question }))} allowMultiple={false}/>
    </div>
  );
}
