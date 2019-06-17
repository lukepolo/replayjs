export default class InputEvents {
  public setup() {
    this.watchForInputChanges();
    this.watchForSelectChanges();
    this.watchForTextareaChanges();
    this.watchForRadioCheckBoxChanges();
  }

  private watchForInputChanges() {
    document.querySelectorAll("input").forEach((element) => {
      element.oninput = (event) => {
        // @ts-ignore // TODO
        event.target.setAttribute("value", event.target.value);
      };
    });
  }

  private watchForSelectChanges() {
    document.querySelectorAll("select").forEach((element) => {
      element.onchange = (event) => {
        // @ts-ignore
        event.target.setAttribute(
          "selected-option",
          // @ts-ignore
          event.target.selectedIndex,
        );
      };
    });
  }

  private watchForTextareaChanges() {
    document.querySelectorAll("textarea").forEach((element) => {
      element.oninput = (event) => {
        // @ts-ignore // TODO
        event.target.setAttribute("value", event.target.value);
      };
    });
  }

  private watchForRadioCheckBoxChanges() {
    document.querySelectorAll('input[type="checkbox"]').forEach((element) => {
      // @ts-ignore
      element.onchange = (event) => {
        document
          .querySelectorAll(`input[type="radio"][name="${event.target.name}"]`)
          .forEach((element) => {
            element.removeAttribute("checked");
          });
        event.target.setAttribute("checked", event.target.checked);
      };
    });
  }
}
