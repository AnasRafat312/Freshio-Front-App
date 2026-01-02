import { Component, OnDestroy, OnInit } from '@angular/core';
import { FertualTree, PrivilegeChecked, PrivilegeTree } from '../../interfaces/privilege';
import { PrivilegeService } from 'src/app/components/pages/privilege/privilege.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Injectable } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Observable } from 'rxjs';
import { __values } from 'tslib';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderService } from 'src/app/shared/components/loading-spinner/services/loader.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Constant } from 'src/app/core/constants/constant';

// Node for to-do item
export class TodoItemNode {
    children: TodoItemNode[];
    label: string;
    id: number;
    isChecked: boolean;
    isLeaf: boolean;
    isPlanType: boolean;
    claimId: number;
}

// Flat to-do item node with expandable and level information
export class TodoItemFlatNode {
    label: string;
    level: number;
    expandable: boolean;
    id: number;
    isChecked: boolean;
    isLeaf: boolean;
    isPlanType: boolean;
    claimId: number;
    children?: TodoItemFlatNode[];
}
@Injectable({
    providedIn: 'root'
})

export class ChecklistDatabase {
    dataChange = new BehaviorSubject<TodoItemNode[]>([]);
    oldTree: PrivilegeTree[];
    roleId: number;
    newTree: any
    dataUpdated = new BehaviorSubject<boolean>(false);
    get data(): TodoItemNode[] {
        return this.dataChange.value;
    }

    constructor(
        private constant: Constant, private privilegeService: PrivilegeService) {
        this.initialize();
    }

    initialize(): Observable<TodoItemNode[]> {
        return new Observable((observer) => {
            this.roleId = JSON.parse(localStorage.getItem('newRoleId'));
            this.privilegeService.getRoleTreeById(JSON.parse(localStorage.getItem('newRoleId'))).subscribe(data => {
                const trueData = this.privilegeService.buildTree(data, null);
                console.log(trueData)
                const dataa = this.buildFileTree(trueData, 0);
                localStorage.setItem('privilegeItems', JSON.stringify(dataa));
                this.dataChange.next(dataa);
                observer.next(dataa);  // Notify that the initialization is complete
                observer.complete();
            });
        });
    }


    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `TodoItemNode`.
     */

    buildFileTree(obj: { [key: string]: any }, level: number): TodoItemNode[] {
        return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
            const item = obj[key];
            const node = new TodoItemNode();
            node.label = obj[key].name;
            node.id = obj[key].id;
            node.claimId = obj[key].claimId;
            node.isPlanType = obj[key].isPlanType;
            node.isLeaf = obj[key].isLeaf;

            // Set the isChecked property based on the data
            node.isChecked = obj[key].isChecked;

            if (item != null) {
                if (typeof item === 'object' && item.children != undefined) {
                    node.children = this.buildFileTree(item.children, level + 1);
                }
            }
            return accumulator.concat(node);
        }, []);
    }
    /** Add an item to to-do list */
    insertItem(parent: TodoItemNode, name: string) {
        if (parent.children) {
            parent.children.push({ label: name } as TodoItemNode);
            this.dataChange.next(this.data);
            this.dataUpdated.next(true); // Emit a change
        }
    }

    updateItem(node: TodoItemNode, name: string) {
        node.label = name;
        this.dataChange.next(this.data);
        this.dataUpdated.next(true); // Emit a change
    }
}
@Component({
    selector: 'app-check-tree',
    templateUrl: './check-tree.component.html',
    styleUrls: ['./check-tree.component.scss'],
    providers: [ChecklistDatabase]
})

export class CheckTreeComponent implements OnInit, OnDestroy {

    dataChange = new BehaviorSubject<TodoItemNode[]>([]);
    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

    /** A selected parent node to be inserted */
    selectedParent: TodoItemFlatNode | null = null;

    /** The new item's name */
    newItemName = '';

    treeControl: FlatTreeControl<TodoItemFlatNode>;

    treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

    dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
    /** The selection for checklist */
    checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

    x: any[]
    dataAfterUpdate: TodoItemFlatNode[];
    SavePrivileges: boolean = false
    ResetPrivileges: boolean = false
    ClearPrivileges: boolean = false
    privilegecheckedList!: PrivilegeChecked[];
    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    get data(): TodoItemNode[] {
        return this.dataChange.value;
    }
    loading = this.loadingSpinnerService.getLoadingStatus();
    showTree: boolean = false
    constructor(
        private constant: Constant,
        private database: ChecklistDatabase,
        private service: PrivilegeService,
        private toasterService: ToastrService,
        private loadingSpinnerService: LoaderService,
        public layoutService: LayoutService) {
        this.service.showTree.subscribe(data => {
            this.showTree = data
        })
        this.treeFlattener = new MatTreeFlattener(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren
        );
        this.treeControl = new FlatTreeControl<TodoItemFlatNode>(
            this.getLevel,
            this.isExpandable
        );
        this.dataSource = new MatTreeFlatDataSource(
            this.treeControl,
            this.treeFlattener
        );

        /*       database.dataChange.subscribe((data) => {
                this.dataSource.data = data;
              }); */
        this.service.checkedPrivilegeList.subscribe(
            data => { this.privilegecheckedList = data }
        )
    }
    ngOnInit(): void {
        this.database.initialize().subscribe(() => {
            // Now that initialization is complete, you can proceed with the rest of your code
            this.database.dataChange.next(JSON.parse(localStorage.getItem('privilegeItems')));
            this.dataSource.data = JSON.parse(localStorage.getItem('privilegeItems'));
            console.log(this.dataSource.data);
            console.log(JSON.parse(localStorage.getItem('privilegeItems')));
        });
    }
    ngOnDestroy(): void {
        localStorage.removeItem('showTree');
        localStorage.removeItem('showRole');
    }
    toggleCheckbox(node: TodoItemFlatNode): void {
        node.isChecked = !node.isChecked; // Toggle the isChecked property
        this.checklistSelection.toggle(node); // Update the selection model
        this.checkAllParentsSelection(node); // Check parent nodes if needed
        this.database.dataUpdated.next(true); // Emit a data change event
    }

    getLevel = (node: TodoItemFlatNode) => node.level;

    isExpandable = (node: TodoItemFlatNode) => node.expandable;

    getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

    hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

    hasNoContent = (_: number, _nodeData: TodoItemFlatNode) =>
        _nodeData.label === '';

    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    transformer = (node: TodoItemNode, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.label === node.label ? existingNode : new TodoItemFlatNode();
        flatNode.label = node.label;
        flatNode.level = level;
        flatNode.id = node.id;
        flatNode.isChecked = node.isChecked;
        flatNode.isLeaf = node.isLeaf;
        flatNode.claimId = node.claimId;
        flatNode.isPlanType = node.isPlanType;
        flatNode.expandable = !!node.children;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    };

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: TodoItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.every((child) =>
            this.checklistSelection.isSelected(child)
        );
        return descAllSelected;
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some((child) =>
            this.checklistSelection.isSelected(child)
        );
        return result && !this.descendantsAllSelected(node);
    }

    todoItemSelectionToggle(node: TodoItemFlatNode): void {
        this.checklistSelection.toggle(node);
        this.updateDescendantsCheck(node);
        this.checkAllParentsSelection(node);
    }
    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
        this.checklistSelection.toggle(node);
        node.isChecked ? (node.isChecked = false) : (node.isChecked = true);
        this.checkAllParentsSelection(node);
    }

    checkAllParentsSelection(node: TodoItemFlatNode): void {
        let parent: TodoItemFlatNode | null = this.getParentNode(node);
        while (parent) {
            if (parent.isChecked !== this.checklistSelection.isSelected(parent)) {
                this.checklistSelection.toggle(parent);
            }
            parent = this.getParentNode(parent);
        }
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: TodoItemFlatNode): void {
        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.every((child) =>
            this.checklistSelection.isSelected(child)
        );
        if (nodeSelected && !descAllSelected) {
            this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
            this.checklistSelection.select(node);
        }
    }

    /* Get the parent node of a node */
    getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    /** Select the category so we can insert the new item. */
    addNewItem(node: TodoItemFlatNode) {
        const parentNode = this.flatNodeMap.get(node);
        this.database.insertItem(parentNode!, '');
        this.treeControl.expand(node);

    }

    /** Save the node to database */
    saveNode(node: TodoItemFlatNode, itemValue: string) {
        const nestedNode = this.flatNodeMap.get(node);
        this.database.updateItem(nestedNode!, itemValue);
    }
    saveAllData() {
        this.dataAfterUpdate = this.dataSource['_flattenedData']['_value']
        const matTreeData = this.convertToMatTreeData(this.dataAfterUpdate);
        this.service.sendUpdatedTree(matTreeData).subscribe(data => {
            this.toasterService.success('Saved');
            //this.layoutService.logout();
        },
            error => {
                this.toasterService.error('Not Saved')
            })
        //this.x = matTreeData
    }
    clearAllCheckboxes() {
        const dataNodes = this.dataSource.data;

        // Recursively clear checkboxes
        function clearCheckboxes(nodes: TodoItemNode[]) {
            for (const node of nodes) {
                node.isChecked = false;

                if (node.children) {
                    clearCheckboxes(node.children);
                }
            }
        }

        clearCheckboxes(dataNodes);

        // Notify Angular that the data has changed
        this.dataSource.data = [...dataNodes];
    }

    convertToMatTreeData(originalModel: TodoItemFlatNode[], parentID: number | null = null): PrivilegeTree[] {
        const matTreeData: PrivilegeTree[] = [];
        let roleId = JSON.parse(localStorage.getItem('newRoleId'));

        for (const node of originalModel) {
            const matTreeNode: PrivilegeTree = {
                ID: node.id,
                IsLeaf: node.isLeaf,
                Type: node.label,
                Value: node.label,
                isChecked: node.isChecked,
                ClaimType: node.claimId,
                roleID: roleId,
                ParentID: parentID,
                ModuleID: node.id,
                actualClaimObject: null,
                actualClaimList: null,
                roleClaims: [],
                userClaims: [],
                children: []
            };

            if (node.children && node.children.length > 0) {
                matTreeNode.children = this.convertToMatTreeData(node.children, node.id);
            }

            matTreeData.push(matTreeNode);
        }

        return matTreeData;
    }
    reset() {
        this.database.initialize().subscribe(() => {
            // Now that initialization is complete, you can proceed with the rest of your code
            this.database.dataChange.next(JSON.parse(localStorage.getItem('privilegeItems')));
            this.dataSource.data = JSON.parse(localStorage.getItem('privilegeItems'));
            console.log(this.dataSource.data);
            console.log(JSON.parse(localStorage.getItem('privilegeItems')));
        });
    }

    checkAllChildren(node: TodoItemFlatNode, checked: boolean) {
        const stack: TodoItemFlatNode[] = [node];
        while (stack.length > 0) {
            const current = stack.pop();
            if (current) {
                current.isChecked = checked;
                this.checklistSelection.toggle(current);

                if (current.children) {
                    stack.push(...current.children);
                }
            }
        }
        this.checkAllParentsSelection(node);
        this.database.dataUpdated.next(true); // Emit a data change event
    }
    updateDescendantsCheck(node: TodoItemFlatNode): void {
        const descendants = this.treeControl.getDescendants(node);
        descendants.forEach((child) => {
            child.isChecked = this.checklistSelection.isSelected(node);
            this.checklistSelection.toggle(child);
        });
    }
}


