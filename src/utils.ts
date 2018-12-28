export function debounce(callback: Function, ms: number) {
  let timer: NodeJS.Timer | null = null;

  return function (this: any, ...args: any[]) {
    const onComplete = () => {
      callback.apply(this, args);
      timer = null;
    };

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(onComplete, ms)
  }
}