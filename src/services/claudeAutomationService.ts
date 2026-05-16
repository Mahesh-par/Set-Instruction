import type { Browser, ElementHandle, Page } from "puppeteer-core";
import puppeteer from "puppeteer-core";

import {
  getChromeExecutablePath,
  getChromeSessionDir
} from "../config/browserSession.js";
import { ApiError } from "../utils/ApiError.js";

type OpenInstructionsInput = {
  claudeLink: string;
  instruction: string;
};

const delay = async (milliseconds: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

const waitForInstructionButton = async (
  page: Page
): Promise<ElementHandle<Element>> => {
  const selectors = [
    'button[aria-label="Edit Instructions"]',
    'button[aria-label*="Instructions" i]'
  ];

  for (const selector of selectors) {
    const button = await page
      .waitForSelector(selector, {
        visible: true,
        timeout: 10_000
      })
      .catch(() => null);

    if (button) {
      return button;
    }
  }

  const buttons = await page.$$("button");

  for (const button of buttons) {
    const label = await button.evaluate((element) => {
      return [
        element.getAttribute("aria-label"),
        element.getAttribute("title"),
        element.textContent
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    });

    if (label.includes("instruction")) {
      return button;
    }
  }

  throw new ApiError(404, "Could not find the Claude instructions button.");
};

const waitForInstructionTextarea = async (
  page: Page
): Promise<ElementHandle<HTMLTextAreaElement>> => {
  const textarea = await page.waitForSelector("textarea", {
    visible: true,
    timeout: 10_000
  });

  if (!textarea) {
    throw new ApiError(404, "Could not find the Claude instructions textarea.");
  }

  return textarea as ElementHandle<HTMLTextAreaElement>;
};

const clearAndFillInstruction = async (
  textarea: ElementHandle<HTMLTextAreaElement>,
  instruction: string
): Promise<void> => {
  await textarea.click();

  await textarea.evaluate((element, value) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    valueSetter?.call(element, "");
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "deleteContentBackward"
      })
    );

    valueSetter?.call(element, value);
    element.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: value,
        inputType: "insertText"
      })
    );
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, instruction);
};

const waitForSaveInstructionsButton = async (
  page: Page
): Promise<ElementHandle<HTMLButtonElement>> => {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    const buttons = await page.$$("button");

    for (const button of buttons) {
      const buttonState = await button.evaluate((element) => {
        const htmlButton = element as HTMLButtonElement;

        return {
          disabled: htmlButton.disabled || htmlButton.ariaDisabled === "true",
          label: htmlButton.textContent?.trim().toLowerCase() ?? "",
          type: htmlButton.type
        };
      });

      if (
        buttonState.type === "button" &&
        buttonState.label.includes("save instructions") &&
        !buttonState.disabled
      ) {
        return button as ElementHandle<HTMLButtonElement>;
      }
    }

    await delay(250);
  }

  throw new ApiError(
    404,
    "Could not find an enabled Claude Save instructions button."
  );
};

const launchClaudeBrowser = async (): Promise<Browser> => {
  return puppeteer.launch({
    executablePath: getChromeExecutablePath(),
    userDataDir: getChromeSessionDir(),
    headless: false,
    defaultViewport: null,
    args: [
      "--start-maximized",
      "--no-first-run",
      "--no-default-browser-check"
    ]
  });
};

export const openClaudeInstructionsPopup = async ({
  claudeLink,
  instruction
}: OpenInstructionsInput): Promise<void> => {
  if (!instruction.trim()) {
    throw new ApiError(400, "Instruction is required.");
  }

  let browser: Browser;

  try {
    browser = await launchClaudeBrowser();
  } catch (error) {
    throw new ApiError(
      500,
      "Could not open Chrome. Close any existing chrome-session window and try again."
    );
  }

  const pages = await browser.pages();
  const page = pages[0] ?? (await browser.newPage());

  await page.goto(claudeLink, {
    waitUntil: "domcontentloaded",
    timeout: 60_000
  });

  await delay(2_000);

  const instructionButton = await waitForInstructionButton(page);
  await instructionButton.click();

  const textarea = await waitForInstructionTextarea(page);
  await clearAndFillInstruction(textarea, instruction);

  const saveButton = await waitForSaveInstructionsButton(page);
  await saveButton.click();

  await delay(1_000);
  await browser.close();
};
