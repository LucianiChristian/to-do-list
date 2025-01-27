import {Project, Task, Subtask} from './classes.js';

export {controller, model, view};

const controller = {
    currentProjectIndex: -1,
    setCurrentProjectIndex(value) {
      if(this.currentProjectIndex === undefined) {
        this.currentProjectIndex = 0;
        return;
      }
      
      this.currentProjectIndex = value;
    },
    addProject(name) {
      this.setCurrentProjectIndex(this.currentProjectIndex + 1);
      model.addProject(name);
    },
    removeProject(index) {
      this.setCurrentProjectIndex(this.currentProjectIndex - 1);
      model.removeProject(index);
    },
    renderProjects() {
      const projectsData = model.getProjects();
      
      const projectElements = view.renderProjects(projectsData);
      
      return projectElements;
    },
    addCurrentProjectTask(name, description, subtasks, status) {
      model.addTask(this.currentProjectIndex, name, description, subtasks, status);
    },
    removeCurrentProjectTask(taskIndex) {
      model.removeTask(this.currentProjectIndex, taskIndex);
    },
    getCurrentProjectTaskStatus(taskIndex) {
      const currentProject = model.projects[this.currentProjectIndex];

      return currentProject.tasks[taskIndex].status;
    },
    setCurrentProjectTaskStatus(status, taskIndex) {
      model.setTaskStatus(this.currentProjectIndex, taskIndex, status);
    },
    toggleCurrentProjectSubtaskStatus(taskIndex, subtaskIndex) {
      model.toggleSubtaskStatus(this.currentProjectIndex, taskIndex, subtaskIndex);
    },
    renderCurrentProjectTitle() {
      const titleText = model.getProject(this.currentProjectIndex).name;
  
      return titleText;
    },
    renderCurrentProjectTaskCards() {
      const projectData = model.getProject(this.currentProjectIndex);
  
      const taskElements = view.renderCurrentProjectTaskCards(projectData);
      
      return taskElements;
    },
    renderCurrentProjectTaskModal(taskIndex) {
      const projectData = model.getProject(this.currentProjectIndex);

      const modal = view.renderCurrentProjectTaskModal(projectData, taskIndex);

      return modal;
    },
    loadFromLocalStorage() {
      model.loadFromLocalStorage();
    },
}
  
const model = {
    projects: [],
    addProject: function(name) {
        this.projects.push(new Project(name));
        this.writeToLocalStorage();
    },
    removeProject: function(index) {
        this.projects.splice(index, 1);
        this.writeToLocalStorage();
    },
    getProjects: function() {
        const projectsCopy = [...this.projects];
        return projectsCopy;
    },
    getProject: function(projectIndex) {
        return this.projects[projectIndex];
    },
    addTask(currentProjectIndex, name, description, subtasks, status) {
        this.projects[currentProjectIndex].addTask(name, description, subtasks, status);
        this.writeToLocalStorage();
    },
    removeTask(currentProjectIndex, taskIndex) {
      this.projects[currentProjectIndex].removeTask(taskIndex);
      this.writeToLocalStorage();
    },
    setTaskStatus(currentProjectIndex, taskIndex, status) {
      const task = this.projects[currentProjectIndex].tasks[taskIndex];
      
      if(status === 'To-Do') {
        task.changeStatusToDo();
      }
      else if(status === 'Doing') {
        task.changeStatusDoing();
      }
      else if(status === 'Done') {
        task.changeStatusDone();
      }

      this.writeToLocalStorage();
    },
    toggleSubtaskStatus(currentProjectIndex, taskIndex, subtaskIndex) {
      const subtask = this.projects[currentProjectIndex].tasks[taskIndex].subtasks[subtaskIndex];

      subtask.toggleComplete();

      this.writeToLocalStorage();
    },
    writeToLocalStorage() {
      const projectsJSON = JSON.stringify(this.projects);

      localStorage.setItem('projects', projectsJSON);
    },
    loadFromLocalStorage() {
      if(localStorage.projects === undefined || localStorage.projects === '[]') {
        controller.addProject('Platform Launch');

        controller.addCurrentProjectTask('Build UI for onboarding flow','a description will go here, of some length...',['subtask 1', 'do stuff'],'To-Do');
        controller.addCurrentProjectTask('Build UI for search','a description will go here, of some length...',['subtask 1'],'Doing');
        controller.addCurrentProjectTask('Design settings and search pages','a description will go here, of some length...',['subtask 1'],'Doing');
        controller.addCurrentProjectTask('UI for menu','a description will go here, of some length...',['subtask 1', 'do stuff'],'To-Do');
        controller.addCurrentProjectTask('UI for settings','a description will go here, of some length...',['subtask 1'],'Doing');
        controller.addCurrentProjectTask('Design settings and search pages','a description will go here, of some length...',['subtask 1'],'Doing');
        controller.addCurrentProjectTask('Build UI for onboarding flow','a description will go here, of some length...',['subtask 1', 'do stuff'],'To-Do');
        controller.addCurrentProjectTask('Build UI for search','a description will go here, of some length...',['subtask 1'],'Doing');
        controller.addCurrentProjectTask('Design settings and search pages','a description will go here, of some length...',['subtask 1'],'Done');
        return;
      }

      const data = JSON.parse(localStorage.projects);

      // instantiate projects with given data using forEach
      const projectsTranslated = data.map(projectData => {

        const projectName = projectData.name;
        const tasks = projectData.tasks;

        // use project name to create project
        const project = new Project(projectName);

        // use tasks to instantiate tasks
        tasks.forEach(task => {
          const {title, description, subtasks, status} = task;

          const subtaskTitles = subtasks.map(subtask => subtask.title);

          project.addTask(title, description, subtaskTitles, status);

          const currentTask = project.tasks[project.tasks.length - 1];

          const currentSubtasks = currentTask.subtasks;

          currentSubtasks.forEach((subtask, index) => {
            subtask.complete = subtasks[index].complete;
          });
        });

        return project;
      });

      this.projects = projectsTranslated;
    },
}

const view = {
    renderProjects(projectsData) {
        const projectElements = projectsData.map((project, index) => {
        const p = document.createElement('p');
        p.textContent = project.name;
        p.dataset.index = index;
        
        return p;
        });
        
        return projectElements;
    },
    renderCurrentProjectTitle(titleData) {
        const h2 = document.createElement('h2');
        h2.textContent = titleData;
        
        return h2;
    },
    renderCurrentProjectTaskCards(currentProjectData) {
      const tasks = currentProjectData.tasks;

      const taskElements = tasks.map((task, index) => {
        const h3 = document.createElement('h3'); 
        h3.textContent = task.title;
        
        const subtaskTotalCount = task.subtasks.length; 
        const subtaskCompletedCount = task.getCompletedSubtaskCount();

        const p = document.createElement('p');
        
        p.textContent = `${subtaskCompletedCount} of ${subtaskTotalCount} subtasks`;
        
        const div = document.createElement('div');
        div.dataset.index = index;
        div.dataset.status = task.status;
        
        div.appendChild(h3);
        div.appendChild(p);
        
        return div;
      });
      
      return taskElements;
    },
    renderCurrentProjectTaskModal(currentProjectData, index) {
      const tasks = currentProjectData.tasks;
      const currentTask = tasks[index];
      // console.log(index);

      const topContent = document.createElement('div');
      topContent.classList.add('taskViewModal__topContent');

      const taskTitle = document.createElement('h3');
      taskTitle.textContent = currentTask.title;

      // ------------- Dropdown ------------ //

      const dropdownContainer = document.createElement('div');
      dropdownContainer.className = 'dropdownContainer';

      const taskSettings = document.createElement('button');
      taskSettings.type = 'button';
      taskSettings.id = 'taskView-settings';
      taskSettings.classList.add('settingsIcon');
      taskSettings.textContent = '⋮';

      const dropdown = document.createElement('div');
      dropdown.id = 'taskView-dropdown';
      dropdown.className = 'dropdown';

      const deleteButton = document.createElement('p');
      deleteButton.id = 'taskView-dropdownDeleteButton';
      deleteButton.textContent = 'Delete Task';
      deleteButton.dataset.index = index;

      dropdownContainer.appendChild(taskSettings);
      dropdown.appendChild(deleteButton);
      dropdownContainer.appendChild(dropdown);

      // Event Listener - Dropdown
      taskSettings.addEventListener('click', function(){
        const dropdown = document.getElementById('taskView-dropdown');
        const display = getComputedStyle(dropdown).display;

        display === 'none'
          ? dropdown.style.display = 'block'
          : dropdown.style.display = 'none';
      });

      // ------------------------------------- //

      topContent.appendChild(taskTitle);
      topContent.appendChild(dropdownContainer);

      const taskDescription = document.createElement('p');
      taskDescription.textContent = currentTask.description;

      const subtasks = currentTask.subtasks.map(subtask => {
        const container = document.createElement('div');
        container.classList.add('taskViewModal__subtask');

        const label = document.createElement('label');
        label.textContent = subtask.title;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = subtask.complete;

        container.appendChild(checkbox);
        container.appendChild(label);

        return container;
      });

      const subtasksContainer = document.createElement('div');
      subtasksContainer.classList.add('taskViewModal__subtaskContainer');
      subtasksContainer.id = 'taskViewSubtasksContainer';
      subtasks.forEach(subtask => subtasksContainer.appendChild(subtask));


      const dropdownStatus = document.createElement('select');
      const toDoStatus = document.createElement('option');
      toDoStatus.value = 'To-Do';
      toDoStatus.textContent = 'To-Do';
      const doingStatus = document.createElement('option');
      doingStatus.value = 'Doing';
      doingStatus.textContent = 'Doing';
      const doneStatus = document.createElement('option');
      doneStatus.value = 'Done';
      doneStatus.textContent = 'Done';
      dropdownStatus.appendChild(toDoStatus);
      dropdownStatus.appendChild(doingStatus);
      dropdownStatus.appendChild(doneStatus);

      const modalElements = {topContent, taskDescription, subtasksContainer, dropdownStatus};

      return modalElements;
    } 
}