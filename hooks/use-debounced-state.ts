import { useState, useMemo, useEffect, Dispatch, SetStateAction } from "react";
import { debounce } from "es-toolkit";

export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, Dispatch<SetStateAction<T>>] {
  // 即时值（受控输入框用）
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);

  // 防抖后的值（最终提交/保存用）
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  // 防抖函数
  const debouncedUpdater = useMemo(
    () => debounce((val: T) => setDebouncedValue(val), delay),
    [delay]
  );

  useEffect(() => {
    return () => {
      debouncedUpdater.cancel?.();
    };
  }, [debouncedUpdater]);

  // 统一的 setter
  const setValue: Dispatch<SetStateAction<T>> = (valOrUpdater) => {
    setImmediateValue((prev) => {
      const newVal =
        typeof valOrUpdater === "function"
          ? (valOrUpdater as (prev: T) => T)(prev)
          : valOrUpdater;
      debouncedUpdater(newVal);
      return newVal;
    });
  };

  return [immediateValue, debouncedValue, setValue];
}
