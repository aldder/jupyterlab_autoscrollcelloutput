import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import { IDisposable, DisposableDelegate } from '@lumino/disposable';
import { ToolbarButton } from '@jupyterlab/apputils';
import { ICellModel, CodeCellModel, CodeCell } from '@jupyterlab/cells';
import { IObservableList } from '@jupyterlab/observables';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { NotebookPanel, INotebookModel, Notebook } from '@jupyterlab/notebook';
import { each } from '@lumino/algorithm';


const plugin: JupyterFrontEndPlugin<void> = {
    id: 'jupyterlab_autoscrollcelloutput:plugin',
    autoStart: true,
    activate: (app: JupyterFrontEnd) => {
        console.log('JupyterLab extension jupyterlab_autoscrollcelloutput is activated!');
        app.docRegistry.addWidgetExtension('Notebook', {
            createNew: (panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable => {
                return new ButtonAutoScrollCellOutput().init(panel);
            }
        });
    }
};


class ButtonAutoScrollCellOutput {
    private notebook!: Notebook;

    init(panel: NotebookPanel): IDisposable {

        const triggerAutoScrollCellOutput = () => {
            if (SET) {
                SET = false;
                console.log('Extension jupyterlab_autoscrollcelloutput disabled for notebook:', panel.id);
                if (button.hasClass('selected')) button.removeClass('selected');
            }
            else {
                SET = true;
                console.log('Extension jupyterlab_autoscrollcelloutput enabled for notebook:', panel.id);
                button.addClass('selected');
            }
            this.notebook.model!.metadata.set('autoscrollcelloutput', SET);
        };

        const button = new ToolbarButton({
            className: 'buttonAutoScrollCellOuput',
            iconClass: 'wll-ScrollIcon',
            label: 'scroll',
            onClick: triggerAutoScrollCellOutput,
            tooltip: 'Auto Scroll Cell Ouput'
        })

        panel.toolbar.insertItem(10, 'AutoScrollCellOutput', button);
        this.notebook = panel.content;
        var SET = true;
        button.addClass('selected');
        this.notebook.model!.cells.changed.connect(this.handlerCellsChange, this);
        return new DisposableDelegate(() => { button.dispose(); });
    }
 
    private handlerCellsChange(
        cells: IObservableList<ICellModel>,
        changed_cells: IObservableList.IChangedArgs<ICellModel>): void {
        if (changed_cells.type == 'add') {
            each(changed_cells.newValues, (cellModel, idx) => {
                if (cellModel instanceof CodeCellModel) {
                    cellModel.outputs.changed.connect((output, arg) => {
                        let autoScrollSet = this.notebook.model!.metadata.get('autoscrollcelloutput');
                        if (['add', 'set'].includes(arg.type) && cellModel.metadata.get("scrolled") && autoScrollSet) {
                            // Find the widget for the model.
                            for (let cell of this.notebook.widgets) {
                                if (cell instanceof CodeCell && cell.model == cellModel) {
                                    // Scroll to bottom
                                    cell.outputArea.node.scrollTop = cell.outputArea.node.scrollHeight;
                                }
                            }
                        }
                    });
                }
            });
        }
    }
}

export default plugin;
