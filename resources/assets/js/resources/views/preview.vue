<style>
    @-webkit-keyframes load-progress { 100% {
        opacity: 0;
        margin-top: -40px;
        margin-left: -40px;
        border-width: 40px;
    }}

    @keyframes load-progress { 100% {
        opacity: 0;
        margin-top: -40px;
        margin-left: -40px;
        border-width: 40px;
    }}

    #clicks div {
        width: 0;
        height: 0;
        opacity: 0.6;
        position: fixed;
        border-radius: 50%;
        border: 1px solid #6C7A89;
        background-color : #6C7A89;
        animation: load-progress 1s;
    }

    #cursor {
        top: 1px;
        z-index: 1;
        width: 25px;
        height: 25px;
        position: absolute;
        background-size: contain;
        background-repeat: no-repeat;
        background-image: url('./../../../images/cursor.png');
    }
</style>
<template>
    <div>
        <iframe id="preview"></iframe>
        <div ref="clientMouse" id="cursor"></div>
        <div id="clicks"></div>
    </div>
</template>
<script>
	import Vue from 'vue'
    import TreeMirror from './../assets/TreeMirror';

	export default Vue.extend({
        data() {
        	return {
        		base : null,
                previewNode : null,
                previewFrame : null,
                clickTimeout : null,
                initialized : false,
            }
        },
        mounted() {
        	this.previewFrame = document.getElementById('preview');
        	this.previewNode = document.getElementById('preview').contentWindow.document;

            while (this.previewNode.firstChild) {
                this.previewNode.removeChild(this.previewNode.firstChild);
            }

            let mirror = new TreeMirror(this.previewNode, {
                createElement: (tagName) => {
                    if (tagName === 'SCRIPT') {
                        let node = document.createElement('NO-SCRIPT');
                        node.style.display = 'none';
                        return node;
                    }
                    if (tagName === 'HEAD') {
                        let node = document.createElement('HEAD');
                        node.appendChild(document.createElement('BASE'));
                        node.firstChild.href = 'http://localdev/dev/fssa/voucher/';
                        return node;
                    }
                }
            })

            this.channel = Echo.join(`chat`);
            this.channel
              .listenForWhisper('initialize', ({rootId, children, base}) => {
                	if(!this.initialized) {
                		this.base = base;
                        mirror.initialize(rootId, children);
                    }
                    this.initialized = true;
                	this.channel.whisper('initialized', {
                		init : true
                    });
                    // while (this.previewNode.firstChild) {
                    //     this.previewNode.removeChild(this.previewNode.firstChild);
                    // }

                })
                .listenForWhisper('windowSize', ({ width, height}) => {
                    this.previewFrame.style.width = width + 'px';
                    this.previewFrame.style.height = height + 'px';
                })
                .listenForWhisper('click', ({ x, y }) => {
                	// clearTimeout(this.clickTimeout);
                    let node = document.createElement('DIV');
                    node.style.top = y + 'px';
                    node.style.left = x + 'px';
                    document.getElementById("clicks").appendChild(node)
                    this.clickTimeout = setTimeout(() => {
                        node.remove();
                    }, 1001)
                })
                .listenForWhisper('scroll', ({ scrollPosition }) => {
                    window.scrollTo(0, scrollPosition);
                })
                .listenForWhisper('changes', ({removed, addedOrMoved, attributes, text}) => {
                    mirror.applyChanged(removed, addedOrMoved, attributes, text);
                })
                .listenForWhisper('mouseMovement', (movements) => {
                	movements.forEach((movement) => {
                		setTimeout(() => {
                            this.$refs.clientMouse.style.top = movement.y + 'px';
                            this.$refs.clientMouse.style.left = movement.x + 'px';
                        }, movement.timing)

                    })
                })
        }
    })
</script>