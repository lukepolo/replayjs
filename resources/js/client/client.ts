// import Echo from 'laravel-echo';
// import TreeMirrorClient from './../resources/assets/TreeMirrorClient';
//
// export default class Client {
//
//   protected echo = null;
//   protected start = null;
//   protected channel = null;
//   protected movements = [];
//
//   constructor () {
//    this.startClient();
//   }
//
//   public startClient() {
//
//     this.start = new Date().getTime();
//
//     this.echo = new Echo({
//       broadcaster: 'socket.io',
//       key: "934c66670cc35329e032c020d6a2bd67",
//       authEndpoint: 'http://support-chat.test/broadcasting/auth',
//       host: 'http://support-chat.test:6001',
//     });
//
//     this.channel = this.echo.join(`chat`)
//       .here(() => {
//         this.setupMirror()
//       })
//       .joining(() => {
//         this.setupMirror()
//       })
//       .listenForWhisper('initialized', () => {
//         this.attachClickEvents();
//         this.attachScrollingEvents();
//         this.attachWindowResizeEvent();
//         this.attachMouseMovementEvents();
//         this.attachAttributeHandlersToInputs();
//       })
//   }
//
//   protected setupMirror() {
//     // TODO - mouse movements should send at the same time?
//     // TODO - should send timings so we can send in batches
//     new TreeMirrorClient(document, {
//       initialize: (rootId, children) => {
//         this.channel.whisper('initialize', {
//           rootId,
//           children,
//           base : location.href.match(/^(.*\/)[^\/]*$/)[1]
//         });
//       },
//       applyChanged: (removed, addedOrMoved, attributes, text) => {
//         this.channel.whisper('changes', {
//           removed,
//           addedOrMoved,
//           attributes,
//           text
//         });
//       }
//     })
//   }
//
//   protected attachClickEvents() {
//     document.onclick = (event : MouseEvent) => {
//       this.channel.whisper('click', {
//           x : event.clientX,
//           y : event.clientY
//       });
//     }
//   }
//
//   protected attachScrollingEvents() {
//     document.onscroll = () => {
//       this.channel.whisper('scroll', {
//         scrollPosition : document.documentElement.scrollTop
//       });
//     }
//   }
//
//   protected attachWindowResizeEvent() {
//     this.resize();
//     window.onresize = () => {
//       this.resize();
//     }
//   }
//
//   private resize() {
//     this.channel.whisper('windowSize', {
//       width: window.innerWidth,
//       height: window.innerHeight,
//     });
//   }
//
//   protected attachMouseMovementEvents() {
//     document.onmousemove = (event : MouseEvent) => {
//       this.movements.push({ x: event.pageX, y: event.pageY, timing : new Date().getTime() - this.start })
//     }
//     this.sendMouseMovements();
//   }
//
//
//   protected sendMouseMovements() {
//     setTimeout(() => {
//       if(this.movements.length) {
//         this.channel.whisper('mouseMovement', this.movements);
//         this.movements = [];
//         this.start = new Date().getTime();
//       }
//       this.sendMouseMovements();
//     }, 1000)
//   }
//
//   protected attachAttributeHandlersToInputs() {
//    Array.from(document.querySelectorAll<HTMLInputElement>('input, textarea')).forEach((element) => {
//       element.oninput = (event : Event) => {
//         let target = <HTMLInputElement>event.target
//         let type = target.type;
//         if(type) {
//           switch(type) {
//             case 'text':
//             case 'textarea':
//               target.setAttribute('value', target.value);
//               break;
//           }
//         }
//       }
//     });
//
//     Array.from(document.querySelectorAll<HTMLSelectElement>('select')).forEach((element) => {
//       element.onchange = (event : Event) => {
//         let target = <HTMLSelectElement>event.target
//         target.setAttribute('selected-option',  target.selectedIndex.toString());
//       }
//     });
//
//     Array.from(document.querySelectorAll<HTMLInputElement>('input[type="checkbox"], input[type="radio"]')).forEach((element) => {
//       element.onchange = (event : Event) => {
//         let target = <HTMLSelectElement>event.target
//         Array.from( document.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${target.name}"]`)).forEach((element) => {
//           element.removeAttribute('checked');
//         });
//         target.setAttribute('checked', target.checked);
//       }
//     });
//   }
// }
//
// new Client();
