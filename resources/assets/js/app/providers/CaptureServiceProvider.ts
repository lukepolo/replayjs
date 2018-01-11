import ServiceProvider from "varie/lib/support/ServiceProvider";
import treeMirror from "tree-mirror";

/*
|--------------------------------------------------------------------------
| App Service Provider
|--------------------------------------------------------------------------
| You can bind various items to the app here, or can create other
| custom providers that bind the container
|
*/
export default class AppProvider extends ServiceProvider {
  channel = null;

  public boot() {
    let oDOM = null;

    // CLIENT
    // socket.on('SessionStarted', function() {
    //   $('#RemoteStatus').text('Status: Connected!');
    //   socketSend({height: $(window).height(), width: $(window).width()});
    //   socketSend({ base: location.href.match(/^(.*\/)[^\/]*$/)[1] });
    //   socketSend(oDOM);
    //   SendMouse();
    //   $('body').append('<div id="AdminPointer"></div> ');
    //   $(window).scroll(function(){
    //     socketSend({scroll: $(window).scrollTop()});
    //   });
    //
    //
    // function socketSend(msg) {
    //   socket.emit('changeHappened', {change: msg, room: sessvars.Session});
    // }
    //
    //
    // var mirrorClient;
    // mirrorClient = new TreeMirrorClient(document, {
    //   initialize: function(rootId, children) {
    //     oDOM = {
    //       f: 'initialize',
    //       args: [rootId, children]
    //     }
    //   },
    //
    //   applyChanged: function(removed, addedOrMoved, attributes, text) {
    //     if(socket != undefined){
    //       socketSend({
    //         f: 'applyChanged',
    //         args: [removed, addedOrMoved, attributes, text]
    //       });
    //     }
    //   }
    // });
    //
    // function SendMouse(){
    //   document.onmousemove = function(e) {
    //     if(!e) e = window.event;
    //
    //     if(e.pageX == null && e.clientX != null) {
    //       var doc = document.documentElement, body = document.body;
    //
    //       e.pageX = e.clientX
    //         + (doc && doc.scrollLeft || body && body.scrollLeft || 0)
    //         - (doc.clientLeft || 0);
    //
    //       e.pageY = e.clientY
    //         + (doc && doc.scrollTop || body && body.scrollTop || 0)
    //         - (doc.clientTop || 0);
    //     }
    //     socket.emit('ClientMousePosition', {room: SessionKey, PositionLeft: e.pageX, PositionTop: e.pageY - 5});
    //   }
    // }

    // LISTENER
  }

  public register() {}
}
