// class responsable for formatting items added to cart
class ToaddItemFormatter {
    formatItem(item) {
        return item.length > 20 ? item.slice(0, 20) + "..." : item;
    }
    formatStatus(completed) {
        return completed ? "Added to Cart" : "Not Added to Cart";
    }
}

// Class responsible for managing the items 
class ToaddManager {
    constructor(toaddItemFormatter) {
        this.toadds = JSON.parse(localStorage.getItem("toadds")) || []; // retrieve items within the local storage
        this.toaddItemFormatter = toaddItemFormatter; 
    }
  
//method to add items to the cart by assigning a unique ID to the item, and it assures that if the item has not been added to the cart, it get put into that category, as well as saving thenew item added into yhr localstorage.
    addItem(item) { 
        const newItem = { 
            id: this.getRandomId(),
            item: this.toaddItemFormatter.formatItem(item),
            completed: false,
            status: "Not Added to Cart",
        };
        this.toadds.push(newItem);
        this.saveToLocalStorage();
        return newItem;
    }

    editItem(id, updatedItem) { // method that allows the user to edit the item. 
        const toadd = this.toadds.find((t) => t.id === id);
        if (toadd) {
            toadd.item = updatedItem;
            this.saveToLocalStorage();
        }
        return toadd;
    }

    deleteItem(id) { //method to allow the user to delete the item.
        this.toadds = this.toadds.filter((toadd) => toadd.id !== id);
        this.saveToLocalStorage();
    }

    toggleItemStatus(id) { //responsible for toggling the completion status of an item with the specified ID.
        const toadd = this.toadds.find((t) => t.id === id);
        if (toadd) {
            toadd.completed = !toadd.completed;
            this.saveToLocalStorage();
        }
    }

    clearAllItems() { // method responsable for clearing all items
        if (this.toadds.length > 0) {
            this.toadds = [];
            this.saveToLocalStorage();
        }
    }

  filterItems(status) { // method responsable for fitlering data based on their completiion status.
    switch (status) {
        case "Added to Cart":
            return this.toadds.filter(toadd => toadd.completed);
        case "Not Added to Cart":
            return this.toadds.filter(toadd => !toadd.completed);
        default:
            return this.toadds;
    }
}

    getRandomId() { //generate ID for the item.
        return (
            Math.random().toString(36).substring(2, 21) +
            Math.random().toString(36).substring(2, 21)
        );
    }

    saveToLocalStorage() {
        localStorage.setItem("toadds", JSON.stringify(this.toadds));
    }
}

// Class responsible for managing the UI and handling events. The user is able to add item to the table and remove it when we they press the button delete. 
class UIManager {
    constructor(toaddManager, toaddItemFormatter) {
        this.toaddManager = toaddManager;
        this.toaddItemFormatter = toaddItemFormatter;
        this.itemInput = document.querySelector("input"); 
        this.addBtn = document.querySelector(".add-task-button");
        this.ItemListBody = document.querySelector(".Item-list-body");
        this.alertMessage = document.querySelector(".alert-message");
        this.deleteAllBtn = document.querySelector(".delete-all-btn");
        this.addEventListeners();
        this.showAllItems();
    }
//when user press keyboard ther eis a change in the webpage
    addEventListeners() {
        // Event listener for adding a new item
        this.addBtn.addEventListener("click", () => {
            this.handleAddItem();
        });

        // Event listener when user press Enter key in the task input
        this.itemInput.addEventListener("keyup", (e) => {
           if (e.keyCode === 13 && this.itemInput.value.length > 0) {
                this.handleAddItem();
            }
        });

        // Event listener for deleting all todos
        this.deleteAllBtn.addEventListener("click", () => {
            this.handleClearAllItem();
        });

        // Event listeners for filter buttons
        const filterButtons = document.querySelectorAll(".filterItems li");
        filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
        const status = button.textContent.toLowerCase();
        this.handleFilterItems(status); 
        });
        });
            
    }
// this method handles the addition of a new item to the list. It checks if the input is empty and displays an error message if it is, otherwise, it adds the item to the list, updates the display, clears the input field, and shows the success message
    handleAddItem() { 
        const item = this.itemInput.value.trim(); // Trim to remove leading/trailing spaces
        if (item === "") {
            this.showAlertMessage("Please enter an item", "error");
        } else {
            const newItem = this.toaddManager.addItem(item);
            this.showAllItems();
            this.itemInput.value = "";
            this.showAlertMessage("Item added successfully", "success");
        }
    }

    handleClearAllItem() {
        this.toaddManager.clearAllItems();
        this.showAllItems();
        this.showAlertMessage("All items cleared successfully", "success");
    }

    showAllItems() {
        const toadds = this.toaddManager.filterItems("all");
        this.displayToadds(toadds);
    }

    displayToadds(toadds) {
        this.ItemListBody.innerHTML = "";
        
        if (toadds.length === 0) {
            this.ItemListBody.innerHTML = `<tr><td colspan="5" class="text-center">No task found</td></tr>`;
            return;
        }
        
        toadds.forEach((item) => { //this allows the HTML to display a list of items in the table. It formats each item's name and status and provides buttons for editing, toggling status, and deleting each item.
            this.ItemListBody.innerHTML += `
                <tr class="toadd-item" data-id="${item.id}">
                    <td>${this.toaddItemFormatter.formatItem(item.item)}</td>
                    <td>${this.toaddItemFormatter.formatStatus(item.completed)}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="uiManager.handleEditItem('${item.id}')">
                            <i class="bx bx-edit-alt bx-bx-xs"></i>    
                        </button>
                        <button class="btn btn-success btn-sm" onclick="uiManager.handleToggleStatus('${item.id}')">
                            <i class="bx bx-check bx-xs"></i>
                        </button>
                        <button class="btn btn-error btn-sm" onclick="uiManager.handleDeleteItem('${item.id}')">
                            <i class="bx bx-trash bx-xs"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    handleEditItem(id) {
        const item = this.toaddManager.toadds.find((t) => t.id === id);
        if (item) {
            this.itemInput.value = item.item;

            const handleUpdate = () => {
                this.toaddManager.editItem(id, this.itemInput.value);
                this.showAlertMessage("Item updated successfully", "success");
                this.showAllItems();
                this.addBtn.innerHTML = "<i class='bx bx-plus bx-sm'></i>";
                this.addBtn.removeEventListener("click", handleUpdate);
            };

            this.addBtn.innerHTML = "<i class='bx bx-check bx-sm'></i>";
            this.addBtn.addEventListener("click", handleUpdate);
        }
    }

    handleToggleStatus(id) {
        this.toaddManager.toggleItemStatus(id);
        this.showAllItems();
    }

    handleDeleteItem(id) {
        this.toaddManager.deleteItem(id);
        this.showAlertMessage("Item deleted successfully", "success");
        this.showAllItems();
    }

    handleFilterItems(status) {
    const filteredItems = this.toaddManager.filterItems(status);
    this.displayToadds(filteredItems);
    }

    showAlertMessage(message, type) {
        const alertBox = `
            <div class="alert alert-${type} shadow-lg mb-5 w-full">
                <div>
                    <span>${message}</span>
                </div>
            </div>
        `;
        this.alertMessage.innerHTML = alertBox;
        this.alertMessage.classList.remove("hide");
        this.alertMessage.classList.add("show");
        setTimeout(() => {
            this.alertMessage.classList.remove("show");
            this.alertMessage.classList.add("hide");
        }, 3000);
    }
}

// Instantiating the classes
const toaddItemFormatter = new ToaddItemFormatter();
const toaddManager = new ToaddManager(toaddItemFormatter);
const uiManager = new UIManager(toaddManager, toaddItemFormatter);
