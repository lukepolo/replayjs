export default class CaptureInputEvents {
  public setup() {
    ["input", "change"].forEach((eventName) => {
      document.addEventListener(eventName, this.captureInput.bind(this));
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
    switch (target.type) {
      case "radio":
      case "checkbox":
        console.info("update vnode...");
        break;
      default:
        console.info("update vnode...");
        break;
    }
  }
}
