export default class CaptureInputEvents {
  public setup() {
    ["input", "change"].map((eventName) => {
      return () => {
        document.addEventListener(eventName, this.captureInput);
      };
    });
  }

  private captureInput({ target }) {
    let {
      tagName,
      name: inputName,
      type: inputType,
      checked: isChecked,
    } = target;

    if (!tagName || ["INPUT", "TEXTAREA", "SELECT"].indexOf(tagName) < 0) {
      console.info(`BAD TAG NAME`, tagName);
      return;
    }

    if (inputType === "password") {
      return;
    }

    this.updateVnode(target);

    if (inputType === "radio") {
      // radios with the same name attribute should become unchecked.
      if (inputType === "radio" && inputName && isChecked) {
        document
          .querySelectorAll(`input[type="radio"][name="${inputName}"]`)
          .forEach((_target) => {
            if (_target !== target) {
              this.updateVnode(_target as HTMLInputElement);
            }
          });
      }
    }
  }

  private updateVnode(target: HTMLInputElement) {
    // TODO - test
    // force dom mutation record it
    switch (target.type) {
      case "select":
        let selectedIndex = ((target as unknown) as HTMLSelectElement)
          .selectedIndex;
        target.setAttribute("selected-option", String(selectedIndex));
        break;
      case "radio":
      case "checkbox":
        target.setAttribute("checked", String(target.checked));
        break;
      default:
        target.setAttribute("value", target.value);
    }
  }
}
