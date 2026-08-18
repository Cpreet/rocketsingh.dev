# rocketsingh.dev product brief

## Product interpretation

rocketsingh.dev is a resolution desk for everyday problems. A person states the outcome they want in ordinary language; the product turns that into a Case, gathers only the missing context, and offers a structured path to completion. Conversation, tools, evidence, and human help are supporting mechanisms. The customer-facing unit is progress toward “done,” not a chat transcript or a search result.

## Experience principles

- Ask for the objective before asking the user to classify it.
- Always make the next action, expected result, and completion condition clear.
- Preserve context when moving from automation to human help.
- Treat uploads and conversations as private by default.
- Keep scrapbook styling decorative; readability, keyboard access, mobile ergonomics, and reduced motion win every conflict.
- Do not require an account before intake.

## MVP scope

This repository implements the public homepage and a text-only intake boundary:

- responsive intake hero with rotating examples;
- accessible screenshot and file affordances;
- validation and an acknowledgement after a Kanbn incoming ticket is created;
- “ask / follow / done” explanation;
- representative question wall;
- interactive structured recipe preview;
- human escalation CTA;
- deterministic scrapbook design primitives.

The MVP does not persist Cases in this application, upload files, charge payments, or provide an operator dashboard. Text entered in the homepage and card intake is sent to the configured private Kanbn incoming list; files remain local until a private upload flow exists. These require backend and policy decisions listed in the implementation plan.

## Success signal

The eventual primary metric is resolved cases divided by cases started. The homepage slice is successful when people understand what to enter, can use the intake on a 320px-wide screen, and understand that the output is a guided resolution with human fallback—not an open-ended chatbot.
