var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/main.ts
var main_exports = {};
__export(main_exports, {
  VIEW_TYPE_FOLDER_BLOCK: () => VIEW_TYPE_FOLDER_BLOCK,
  default: () => FolderBlockViewPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var VIEW_TYPE_FOLDER_BLOCK = "folder-block-view";
var DEFAULT_SETTINGS = {
  columns: 3,
  showFileCount: true,
  showModifiedDate: false
};
var FolderBlockViewPlugin = class extends import_obsidian.Plugin {
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      console.log("\u2705 Folder Block View loaded");
      this.registerView(
        VIEW_TYPE_FOLDER_BLOCK,
        (leaf) => new FolderBlockView(leaf, this)
      );
      this.addCommand({
        id: "open-folder-block-view",
        name: "Open Folder Block View",
        callback: () => this.openView()
      });
      this.addRibbonIcon("grid", "Open Folder Block View", () => this.openView());
      this.addSettingTab(new FolderBlockSettingTab(this.app, this));
    });
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_FOLDER_BLOCK);
    console.log("\u{1F50C} Folder Block View unloaded");
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
  openView() {
    return __async(this, null, function* () {
      this.app.workspace.detachLeavesOfType(VIEW_TYPE_FOLDER_BLOCK);
      const leaf = this.app.workspace.getRightLeaf(false);
      if (leaf) {
        yield leaf.setViewState({ type: VIEW_TYPE_FOLDER_BLOCK, active: true });
        this.app.workspace.revealLeaf(leaf);
      }
    });
  }
  getFolderFiles(folder) {
    return folder.children.filter((c) => c instanceof import_obsidian.TFile);
  }
  getSubfolders(folder) {
    return folder.children.filter((c) => c instanceof import_obsidian.TFolder);
  }
};
var FolderBlockView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.currentFolder = this.app.vault.getRoot();
  }
  getViewType() {
    return VIEW_TYPE_FOLDER_BLOCK;
  }
  getDisplayText() {
    return `\u{1F4C1} ${this.currentFolder.name}`;
  }
  getIcon() {
    return "grid";
  }
  onOpen() {
    return __async(this, null, function* () {
      this.render();
    });
  }
  onClose() {
    return __async(this, null, function* () {
    });
  }
  render() {
    const container = this.containerEl.children[1];
    container.empty();
    const header = container.createDiv({ cls: "fbv-header" });
    header.createEl("h2", { text: `\u{1F4C2} ${this.currentFolder.path === "/" ? "Vault" : this.currentFolder.name}` });
    if (this.currentFolder.parent) {
      const upBtn = header.createEl("button", { text: "\u2B06\uFE0F Up" });
      upBtn.onclick = () => {
        if (this.currentFolder.parent) {
          this.currentFolder = this.currentFolder.parent;
          this.render();
        }
      };
    }
    const grid = container.createDiv({ cls: "fbv-grid" });
    grid.style.setProperty("--fbv-columns", this.plugin.settings.columns.toString());
    const subfolders = this.plugin.getSubfolders(this.currentFolder);
    subfolders.forEach((folder) => {
      const block = this.createFolderBlock(folder);
      grid.appendChild(block);
    });
    const files = this.plugin.getFolderFiles(this.currentFolder);
    if (files.length > 0) {
      container.createEl("h3", { text: `\u{1F4C4} Files (${files.length})` });
      const filesGrid = container.createDiv({ cls: "fbv-grid fbv-grid-files" });
      filesGrid.style.setProperty("--fbv-columns", "4");
      files.forEach((file) => {
        const block = this.createFileBlock(file);
        filesGrid.appendChild(block);
      });
    }
    if (subfolders.length === 0 && files.length === 0) {
      container.createDiv({ text: "\u2728 \u042D\u0442\u0430 \u043F\u0430\u043F\u043A\u0430 \u043F\u0443\u0441\u0442\u0430", cls: "fbv-empty" });
    }
  }
  createFolderBlock(folder) {
    const block = document.createElement("div");
    block.className = "fbv-block fbv-block-folder";
    const icon = block.createDiv({ cls: "fbv-icon" });
    (0, import_obsidian.setIcon)(icon, "folder");
    block.createDiv({ text: folder.name, cls: "fbv-title" });
    if (this.plugin.settings.showFileCount) {
      const fileCount = this.plugin.getFolderFiles(folder).length;
      block.createDiv({ text: `\u{1F4C4} ${fileCount}`, cls: "fbv-meta" });
    }
    block.onclick = () => {
      this.currentFolder = folder;
      this.render();
    };
    block.oncontextmenu = (e) => {
      e.preventDefault();
      this.showFolderMenu(e, folder);
    };
    return block;
  }
  createFileBlock(file) {
    const block = document.createElement("div");
    block.className = "fbv-block fbv-block-file";
    const icon = block.createDiv({ cls: "fbv-icon" });
    (0, import_obsidian.setIcon)(icon, "file-text");
    block.createDiv({ text: file.basename, cls: "fbv-title" });
    if (this.plugin.settings.showModifiedDate) {
      const date = new Date(file.stat.mtime).toLocaleDateString();
      block.createDiv({ text: date, cls: "fbv-meta" });
    }
    block.onclick = () => {
      this.app.workspace.openLinkText(file.path, file.path);
    };
    return block;
  }
  showFolderMenu(e, folder) {
    const menu = new import_obsidian.Menu();
    menu.addItem(
      (item) => item.setTitle("\u{1F4DD} \u041D\u043E\u0432\u044B\u0439 \u0444\u0430\u0439\u043B \u0437\u0434\u0435\u0441\u044C").onClick(() => __async(this, null, function* () {
        const path = `${folder.path}/Untitled.md`;
        const file = yield this.app.vault.create(path, "");
        this.app.workspace.openLinkText(file.path, file.path);
      }))
    );
    menu.showAtPosition({ x: e.pageX, y: e.pageY });
  }
};
var FolderBlockSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Columns").setDesc("Number of columns in grid").addSlider(
      (slider) => slider.setLimits(1, 5, 1).setValue(this.plugin.settings.columns).onChange((value) => __async(this, null, function* () {
        this.plugin.settings.columns = value;
        yield this.plugin.saveSettings();
        this.plugin.openView();
      }))
    );
    new import_obsidian.Setting(containerEl).setName("Show file count").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showFileCount).onChange((value) => __async(this, null, function* () {
        this.plugin.settings.showFileCount = value;
        yield this.plugin.saveSettings();
        this.plugin.openView();
      }))
    );
    new import_obsidian.Setting(containerEl).setName("Show modified date").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showModifiedDate).onChange((value) => __async(this, null, function* () {
        this.plugin.settings.showModifiedDate = value;
        yield this.plugin.saveSettings();
        this.plugin.openView();
      }))
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VIEW_TYPE_FOLDER_BLOCK
});
//# sourceMappingURL=main.js.map
