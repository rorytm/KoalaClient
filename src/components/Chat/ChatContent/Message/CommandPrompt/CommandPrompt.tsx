import React, { useEffect, useRef, useState } from "react";
import useStore from "@store/store";

import { useTranslation } from "react-i18next";
import { matchSorter } from "match-sorter";
import { Prompt } from "@type/prompt";

import useHideOnOutsideClick from "@hooks/useHideOnOutsideClick";

const CommandPrompt = ({
  cursorPosition,
  _setContent,
}: {
  cursorPosition: number;
  _setContent: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { t } = useTranslation();
  const prompts = useStore((state) => state.prompts);
  const [_prompts, _setPrompts] = useState<Prompt[]>(prompts);
  const [input, setInput] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAbove, setIsAbove] = useState(false);
  const [dropDown, setDropDown, dropDownRef] = useHideOnOutsideClick();

  useEffect(() => {
    if (dropDown && inputRef.current) {
      // When dropdown is visible, focus the input
      inputRef.current.focus();
    }
  }, [dropDown]);

  useEffect(() => {
    if (dropDown && dropDownRef.current) {
      const rect = dropDownRef.current.getBoundingClientRect();
      setIsAbove(rect.top > window.innerHeight / 2);
    }
  }, [dropDown]);

  useEffect(() => {
    const filteredPrompts = matchSorter(useStore.getState().prompts, input, {
      keys: ["name"],
    });
    _setPrompts(filteredPrompts);
  }, [input]);

  useEffect(() => {
    _setPrompts(prompts);
    setInput("");
  }, [prompts]);

  return (
    <div className="relative max-wd-sm" ref={dropDownRef}>
      <button
        className="btn btn-neutral btn-small"
        aria-label="prompt library"
        onClick={() => setDropDown(!dropDown)}
      >
        /
      </button>
      <div
        className={`${dropDown ? "" : "hidden"} absolute ${
          isAbove ? "bottom-full" : "top-100 bottom-100"
        } right-0 z-10 bg-white rounded-lg shadow-xl border-b border-black/10/50 text-neutral-dark group opacity-90`}
      >
        <div className="text-sm px-4 py-2 w-max">{t("promptLibrary")}</div>
        <input
          ref={inputRef}
          type="text"
          className="text-neutral-dark p-3 text-sm border-none bg-custom-white m-0 w-full mr-0 h-8 focus:outline-none"
          value={input}
          placeholder={t("search") as string}
          onChange={(e) => {
            setInput(e.target.value);
          }}
        />
        <ul className="text-sm text-neutral-base p-0 m-0 w-max max-w-sm max-md:max-w-[90vw] max-h-32 overflow-auto">
          {_prompts.map((cp) => (
            <li
              className="px-4 py-2 hover:bg-custom-white cursor-pointer text-start w-full"
              onClick={() => {
                _setContent((prev) => {
                  let startContent = prev.slice(0, cursorPosition);
                  let endContent = prev.slice(cursorPosition);

                  let paddedStart = (!startContent.endsWith("\n") &&
                      startContent.length > 0)
                    ? "\n"
                    : "";
                  let paddedEnd = (!endContent.startsWith("\n") &&
                      endContent.length > 0)
                    ? "\n"
                    : "";

                  return startContent + paddedStart + cp.prompt + paddedEnd +
                    endContent;
                });
                setDropDown(false);
              }}
              key={cp.id}
            >
              {cp.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommandPrompt;
