export default class CaptureInputEvents {
  public setup() {
    ["input", "change"].forEach((eventName) => {
      console.info("setup............", eventName);
      document.addEventListener(eventName, this.captureInput.bind(this));
    });
  }

  private captureInput({ target }) {
    console.info("capture input.....");
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
    switch (target.type) {
      case "select":
        let selectedIndex = ((target as unknown) as HTMLSelectElement)
          .selectedIndex;
        this.setAttribute(target, "selected-option", String(selectedIndex));
        break;
      case "radio":
      case "checkbox":
        this.setAttribute(target, "checked", String(target.checked));
        break;
      default:
        this.setAttribute(target, "value", target.value);
    }
  }

  private setAttribute(target, attribute, value) {
    console.info("here?");
    target.setAttribute(attribute, value);
  }
}
