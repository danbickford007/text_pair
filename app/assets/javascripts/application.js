// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require_tree .
//
//
colorText = function(){
  var content = $("#content");
  
}



$(function () {
  "use strict";
   
  var content = $('#content');
  var input = $('#content');
  var myName = 'billy mczilly';
  var myColor = 'blue';
  var status = $("#status");
  window.WebSocket = window.WebSocket || window.MozWebSocket;
   
  if (!window.WebSocket) {
    content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
    + 'support WebSockets.'} ));
    return;
  }
   
  var connection = new WebSocket('ws://127.0.0.1:4000');
   
  connection.onopen = function () {
  };
   
  connection.onerror = function (error) {
    content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
    + 'connection or the server is down.' } ));
  };
   
  connection.onmessage = function (message) {
    try {
      var json = JSON.parse(message.data);
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON: ', message.data);
      return;
    }
     
    if (json.type === 'color') { // first response from the server with user's color
      myColor = json.data;
      status.text(myName + ': ').css('color', myColor);
      input.removeAttr('disabled').focus();
    } else if (json.type === 'history') { // entire message history
      for (var i=0; i < json.data.length; i++) {
      addMessage(json.data[i].author, json.data[i].text,
      json.data[i].color, json.data.index, json.data.nodePosition);
      }
    } else if (json.type === 'message') { // it's a single message
      addMessage(json.data.author, json.data.text,
      json.data.color, json.data.index, json.data.nodePosition);
    } else {
      console.log('Hmm..., I\'ve never seen JSON like this: ', json);
    }
  };
   
  $(document).keyup(function(e) {
      var msg = $("#content").html();
      if (!msg) {
        return;
      }
      //var index = getCaretIndex(document.getElementById('content'));
      var indexNode = getSelectionOffsetFrom(document.getElementById('content'));
      console.log("::::::"+indexNode[0]+"::"+indexNode[1]);
      connection.send(JSON.stringify({'message':msg, 'index':indexNode[0], 'nodePosition':indexNode[1]}));
      $(this).val('');
      if (myName === false) {
        myName = msg;
      }
  });
   
  setInterval(function() {
    if (connection.readyState !== 1) {
    status.text('Error');
    input.attr('disabled', 'disabled').val('Unable to comminucate '
    + 'with the WebSocket server.');
    }
  }, 3000);
   
  function addMessage(author, message, color, index, nodePosition) {
    content.html('');
    content.html(message);
    console.log(index);
    setEndOfContenteditable(document.getElementById('content'), index, nodePosition);
  }

  function getSelectionOffsetFrom(parent) {
    var sel = window.getSelection();
    var current = sel.anchorNode;
    var offset = 0;//sel.anchorOffset;
    var node = 0;
    while(current && current !== parent) {
        var sibling = current;
        while(sibling = sibling.previousSibling) {
            if(sibling.nodeType === 3) {
                node += 1;
            } else if(sibling.nodeType === 1) {
                node += 1;
            }
        }

        current = current.parentNode;
    }

    if(!current) {
        return null;
    }
    
    var current = sel.anchorNode;
    offset = getCaretIndex(current);
    return [offset, node];
  }

  
  function setEndOfContenteditable(contentEditableElement, index, nodePosition)
  {
    if (window.getSelection) {
        var sel = window.getSelection();
        var textNode = document.getElementById("content");
        var range = document.createRange();
        console.log("+++++++++++++"+index+"++++++++++++"+nodePosition+"..........."+textNode.childNodes.length);
        console.log("===>"+textNode.childNodes[nodePosition].innerHTML);
        console.log("!!!!!!!!!!"+sel.rangeCount);
        range.selectNodeContents(textNode.childNodes[nodePosition].firstChild);
        range.setStart(textNode.childNodes[nodePosition].firstChild, index);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    return;

  }

  function getCaretIndex(element) {
      var caretOffset = 0;
      if (typeof window.getSelection != "undefined") {
          var range = window.getSelection().getRangeAt(0);
          var preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          caretOffset = preCaretRange.toString().length;
      } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
          var textRange = document.selection.createRange();
          var preCaretTextRange = document.body.createTextRange();
          preCaretTextRange.moveToElementText(element);
          preCaretTextRange.setEndPoint("EndToEnd", textRange);
          caretOffset = preCaretTextRange.text.length;
      }
      return caretOffset;
  }

});


