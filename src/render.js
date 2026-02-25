export const Render = (function() {
    function renderSidebar(element, allElements) {
        Object.values(allElements).forEach(el => el.classList.remove("active"));
        element.classList.add("active");
        sessionStorage.setItem("activeTab", element.id);
    }

    function renderHeading(heading) {
       let activeTab = document.querySelector(".tab-list.active > .tab");
       return heading.textContent = activeTab.textContent;
    }

    function toggleSidebar(sidebar, btn) {
        switch (true) {
            case (sidebar.classList.contains("normal")):
                sidebar.classList.add("collapsed");
                sidebar.classList.remove("normal");
                btn.classList.add("collapsed");
                btn.classList.remove("normal");
                break;
            case (sidebar.classList.contains("collapsed")):
                sidebar.classList.add("normal");
                sidebar.classList.remove("collapsed");
                btn.classList.add("normal");
                btn.classList.remove("collapsed");
                break;
        }
    }

    function toggleTheme(btn) {
        if(btn.classList.contains("light")){
            document.documentElement.classList.toggle("dark");
            btn.classList.add("dark");
            btn.classList.remove("light");
        } else {
            document.documentElement.classList.toggle("dark");
            btn.classList.add("light");
            btn.classList.remove("dark");
        }
        
    }

    function renderSubtaskList(list, input) {
        const id = crypto.randomUUID();
        const subtask = document.createElement("li");
        subtask.innerHTML = `
            <div class="checkbox-wrapper">
                <input class="default-checkbox" type="checkbox" id="${id}">
                <div class="custom-checkbox"></div>
            </div>
            <label for="${id}">${input.value}</label>
            <button type="button" class="btn-delete-subtask"></button>
        `;

        list.appendChild(subtask);
    }

    function closeDialog(dialog, reset) {
        dialog.close();
    }

    function resetNewTaskDialog(inputs, list) {
        inputs.forEach(input => input.value="");
        list.replaceChildren();
    }

    function renderTask(tasksContainer, taskObj) {
        const task = document.createElement("div");
        task.classList.add("task");

        let project = "";
        if (typeof taskObj === 'string') {
            project = taskObj
        }   else {
            project = "";
        }

        task.innerHTML = `
            <button type="button" class="checkbox"></button>
            <div class="left">
                <div class="text">
                    <h3 class="title">${taskObj.title}<h3>
                    <p class="desc">${taskObj.desc}</p>
                </div>
                <div class="details">
                    <div class="date"><span class="icon"></span>${taskObj.dueDate}</div>
                    <div class="checklist"><span class="icon"></span></div> 
                </div>
            </div>

            <div class="right">
                <div class="buttons">
                    <button type="button" class="btn-edit"></button>
                    <button type="button" class="btn-delete"></button>
                </div>
                <div class="from">${project}</div>
            </div>

        `
        tasksContainer.appendChild(task);
    }

    return {
        renderSidebar,
        toggleSidebar,
        toggleTheme,
        renderHeading,
        closeDialog,
        resetNewTaskDialog,
        renderSubtaskList,
        renderTask,
    }
})();