console.log("index running");

// VDom representations
function creatElement(tagName, { attrs = {}, children = [] } = {}) {
  return {
    tagName,
    attrs,
    children,
  };
}

function addChildren(ele) {
  if (ele.childNodes.length > 0) {
    let vdom = [];
    for (let index = 0; index < ele.childNodes.length; index++) {
      let elem = ele.childNodes[index];
      console.log(elem);
      vdom.push(
        creatElement(elem.nodeName, {
          attrs: {
            id: elem.id,
          },
          children: addChildren(elem),
        })
      );
    }
    return vdom;
  }
  return null;
}

function render(dom, elementToReplace) {}

class VDom {
  // The main app container element
  _mainEle = null;
  // Virtual Dom representation
  dom = [];
  // The main data object
  data = null;

  constructor(settings) {
    this._mainEle = document.getElementById(settings.el);

    // Make virtual dom representation
    this.dom.push(
      creatElement("div", {
        attrs: {
          id: settings.el,
          data: settings.data,
        },
        children: addChildren(this._mainEle),
      })
    );

    console.log(this.dom);

    // Render virtual dom to replace the real dom
    render(this.dom, this._mainEle);
  }
}
