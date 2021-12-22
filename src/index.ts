import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { ToolbarButton } from '@jupyterlab/apputils';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel } from '@jupyterlab/notebook';


function JupyterLabAutoScroll() {
  let divs = document.querySelectorAll('.lm-Widget.p-Widget.jp-OutputArea.jp-Cell-outputArea');
  for(let i=0; i<divs.length; i++) {
    let div = divs[i];
    if(div.scrollHeight > 0 && 
       div.scrollTop != div.scrollHeight &&
       div.parentElement != null &&
       div.parentElement.parentElement != null &&
       div.parentElement.parentElement.childNodes[1].childNodes[1].childNodes[0].childNodes[0].textContent == "[*]:") {
      if(div.childNodes.length == 1) {
        div.scrollTop = div.scrollHeight;
      }
    }
  }
}

/**
 * Initialization data for the jupyterlab_autoscrollcelloutput extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_autoscrollcelloutput:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab_autoscrollcelloutput is activated!');
    app.docRegistry.addWidgetExtension('Notebook', new ButtonAutoScrollCellOutput());
  }
};

export class ButtonAutoScrollCellOutput
  implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>
  {
    createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
      
      
      const triggerAutoScrollCellOutput = () => {
        if (SET) {
          SET = false;
          console.log('Extension jupyterlab_autoscrollcelloutput disabled');
          clearInterval(t);
          if (button.hasClass('selected')) button.removeClass('selected');
        }
        else {
          SET = true;
          console.log('Extension jupyterlab_autoscrollcelloutput enabled');
          t = setInterval(JupyterLabAutoScroll, 10);
          button.addClass('selected');
        }
      };

      const button = new ToolbarButton({
        className: 'buttonAutoScrollCellOuput',
        iconClass: 'wll-ScrollIcon',
        label: 'scroll',
        onClick: triggerAutoScrollCellOutput,
        tooltip: 'Auto Scroll Cell Ouput'
      })

      panel.toolbar.insertItem(10, 'AutoScrollCellOutput', button);

      var SET = true;
      var t = setInterval(JupyterLabAutoScroll,10);
      button.addClass('selected');
      return new DisposableDelegate(() => { button.dispose(); });
    }
  }

export default plugin;
