figma.showUI(__html__, {
  width: 432,
  height: 810,
  title: "Design System Check"
});

function notifyDocumentation(reason, url) {
  if (reason === undefined || reason === null) {
    reason = "missing";
  }

  figma.ui.postMessage({
    type: "documentation-link",
    url: url !== undefined && url !== null ? url : null,
    reason: reason
  });
}

function resolveDocumentationFromSelection() {
  var selection = figma.currentPage.selection[0];

  if (!selection) {
    notifyDocumentation("no-selection");
    return;
  }

  var node = selection;

  if ("mainComponent" in selection && selection.mainComponent) {
    node = selection.mainComponent;
  }

  if (!("getPluginData" in node)) {
    notifyDocumentation("unsupported");
    return;
  }

  var keys = [
    "documentation",
    "documentationUrl",
    "docUrl",
    "docs",
    "url"
  ];

  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i];
    var value = node.getPluginData(key);
    if (typeof value === "string") {
      var trimmed = value.trim();
      if (trimmed) {
        notifyDocumentation("success", trimmed);
        return;
      }
    }
  }

  notifyDocumentation("missing");
}

figma.ui.onmessage = function (message) {
  if (!message) {
    return;
  }

  if (message.type === "request-documentation") {
    resolveDocumentationFromSelection();
  }
};

figma.on("selectionchange", function () {
  var currentSelection = figma.currentPage.selection;
  if (!currentSelection || currentSelection.length === 0) {
    notifyDocumentation("no-selection");
  }
});
