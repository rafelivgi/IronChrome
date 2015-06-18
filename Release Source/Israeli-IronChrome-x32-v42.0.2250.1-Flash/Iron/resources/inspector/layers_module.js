WebInspector.LayerPaintProfilerView=function(showImageForLayerCallback)
{WebInspector.SplitView.call(this,true,false);this._showImageForLayerCallback=showImageForLayerCallback;this._logTreeView=new WebInspector.PaintProfilerCommandLogView();this.setSidebarView(this._logTreeView);this._paintProfilerView=new WebInspector.PaintProfilerView(this._showImage.bind(this));this.setMainView(this._paintProfilerView);this._paintProfilerView.addEventListener(WebInspector.PaintProfilerView.Events.WindowChanged,this._onWindowChanged,this);}
WebInspector.LayerPaintProfilerView.prototype={profileLayer:function(layer)
{this._logTreeView.setCommandLog(null,[]);this._paintProfilerView.setSnapshotAndLog(null,[],null);(layer).requestSnapshot(onSnapshotDone.bind(this));function onSnapshotDone(snapshot)
{this._layer=layer;snapshot.commandLog(onCommandLogDone.bind(this,snapshot));}
function onCommandLogDone(snapshot,log)
{this._logTreeView.setCommandLog(snapshot.target(),log);this._paintProfilerView.setSnapshotAndLog(snapshot||null,log||[],null);}},_onWindowChanged:function()
{var window=this._paintProfilerView.windowBoundaries();this._logTreeView.updateWindow(window.left,window.right);},_showImage:function(imageURL)
{this._showImageForLayerCallback(this._layer,imageURL);},__proto__:WebInspector.SplitView.prototype};;WebInspector.LayersPanel=function()
{WebInspector.PanelWithSidebar.call(this,"layers",225);this.registerRequiredCSS("timeline/timelinePanel.css");this._target=null;WebInspector.targetManager.observeTargets(this);this._layerViewHost=new WebInspector.LayerViewHost();this._layerTreeOutline=new WebInspector.LayerTreeOutline(this._layerViewHost);this.panelSidebarElement().appendChild(this._layerTreeOutline.element);this.setDefaultFocusedElement(this._layerTreeOutline.element);this._rightSplitView=new WebInspector.SplitView(false,true,"layerDetailsSplitViewState");this.splitView().setMainView(this._rightSplitView);this._layers3DView=new WebInspector.Layers3DView(this._layerViewHost);this._rightSplitView.setMainView(this._layers3DView);this._layers3DView.addEventListener(WebInspector.Layers3DView.Events.LayerSnapshotRequested,this._onSnapshotRequested,this);this._tabbedPane=new WebInspector.TabbedPane();this._rightSplitView.setSidebarView(this._tabbedPane);this._layerDetailsView=new WebInspector.LayerDetailsView(this._layerViewHost);this._tabbedPane.appendTab(WebInspector.LayersPanel.DetailsViewTabs.Details,WebInspector.UIString("Details"),this._layerDetailsView);this._paintProfilerView=new WebInspector.LayerPaintProfilerView(this._layers3DView.showImageForLayer.bind(this._layers3DView));this._tabbedPane.appendTab(WebInspector.LayersPanel.DetailsViewTabs.Profiler,WebInspector.UIString("Profiler"),this._paintProfilerView);}
WebInspector.LayersPanel.DetailsViewTabs={Details:"details",Profiler:"profiler"};WebInspector.LayersPanel.prototype={focus:function()
{this._layerTreeOutline.focus();},wasShown:function()
{WebInspector.Panel.prototype.wasShown.call(this);if(this._target)
this._target.layerTreeModel.enable();this._layerTreeOutline.focus();},willHide:function()
{if(this._target)
this._target.layerTreeModel.disable();WebInspector.Panel.prototype.willHide.call(this);},targetAdded:function(target)
{if(this._target)
return;this._target=target;this._target.layerTreeModel.addEventListener(WebInspector.LayerTreeModel.Events.LayerTreeChanged,this._onLayerTreeUpdated,this);this._target.layerTreeModel.addEventListener(WebInspector.LayerTreeModel.Events.LayerPainted,this._onLayerPainted,this);if(this.isShowing())
this._target.layerTreeModel.enable();},targetRemoved:function(target)
{if(this._target!==target)
return;this._target.layerTreeModel.removeEventListener(WebInspector.LayerTreeModel.Events.LayerTreeChanged,this._onLayerTreeUpdated,this);this._target.layerTreeModel.removeEventListener(WebInspector.LayerTreeModel.Events.LayerPainted,this._onLayerPainted,this);this._target.layerTreeModel.disable();this._target=null;},_showLayerTree:function(deferredLayerTree)
{deferredLayerTree.resolve(this._layerViewHost.setLayerTree.bind(this._layerViewHost));},_onLayerTreeUpdated:function()
{if(this._target)
this._layerViewHost.setLayerTree(this._target.layerTreeModel.layerTree());},_onLayerPainted:function(event)
{if(!this._target)
return;this._layers3DView.setLayerTree(this._target.layerTreeModel.layerTree());if(this._layerViewHost.selection()&&this._layerViewHost.selection().layer()===event.data)
this._layerDetailsView.update();},_onSnapshotRequested:function(event)
{var layer=(event.data);this._tabbedPane.selectTab(WebInspector.LayersPanel.DetailsViewTabs.Profiler);this._paintProfilerView.profileLayer(layer);},__proto__:WebInspector.PanelWithSidebar.prototype}
WebInspector.LayersPanel.LayerTreeRevealer=function()
{}
WebInspector.LayersPanel.LayerTreeRevealer.prototype={reveal:function(snapshotData)
{if(!(snapshotData instanceof WebInspector.DeferredLayerTree))
return Promise.reject(new Error("Internal error: not a WebInspector.DeferredLayerTree"));var panel=WebInspector.LayersPanel._instance();WebInspector.inspectorView.setCurrentPanel(panel);panel._showLayerTree((snapshotData));return Promise.resolve();}}
WebInspector.LayersPanel._instance=function()
{if(!WebInspector.LayersPanel._instanceObject)
WebInspector.LayersPanel._instanceObject=new WebInspector.LayersPanel();return WebInspector.LayersPanel._instanceObject;}
WebInspector.LayersPanelFactory=function()
{}
WebInspector.LayersPanelFactory.prototype={createPanel:function()
{return WebInspector.LayersPanel._instance();}};