using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace gameCenter.Projects.To_Do_List.Models
{
    internal class ToDoListModel
    {
        public ObservableCollection<ToDoTask> Tasks { get; set; }


        public ToDoListModel()
        {
            Tasks = new ObservableCollection<ToDoTask>();
        }

        public void UpdateTask(int taskId,string newDescription)
        {
            ToDoTask task = Tasks.FirstOrDefault(task => task.Id == taskId);

            if (task != null)
            {
                task.Description = newDescription;
            }
            else
            {
                throw new Exception("The task with this Id wasn't found");
            }
        }
        public void ToggleTaskComplete(int taskId)
        {
            ToDoTask task = Tasks.FirstOrDefault(task => task.Id == taskId);

            if (task != null)
            {
                task.IsCompleted = !task.IsCompleted;
            }
            else
            {
                throw new Exception("The task with this Id wasn't found");
            }
        }
        public void AddNewTask(ToDoTask task)
        {
            Tasks.Add(task);
        }
        public void RemoveTask(ToDoTask task)
        {
            Tasks.Remove(task);
        }
    }
}
