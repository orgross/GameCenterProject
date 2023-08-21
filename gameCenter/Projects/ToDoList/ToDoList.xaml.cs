using gameCenter.Projects.To_Do_List.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace gameCenter.Projects.To_Do_List
{
    /// <summary>
    /// Interaction logic for ToDoList.xaml
    /// </summary>
    public partial class ToDoList : Window
    {
        private ToDoListModel _todolist;


        public ToDoList()
        {
            InitializeComponent();
            InitializeTasks();
        }

        //InitializeTasks -> 
        //1. create new TodoListModel
        //2. add 2 static tasks
        //3. listTasks.ItemsSource = _todoList.Tasks;
        
        private void InitializeTasks()
        {
            _todolist = new ToDoListModel();
            _todolist.AddNewTask(new ToDoTask(1, "Do Homework"));
            _todolist.AddNewTask(new ToDoTask(2, "Complete your project"));
            listTasks.ItemsSource = _todolist.Tasks;
        }

        //OnTaskToggled
        //get the task (and task id) from the checkBox.DataContext (the DataContext is actually the TodoTask object)
        //excute the toggle function from the model
        private void OnTaskToggled(object sender, RoutedEventArgs e)
        {
            if(sender is CheckBox checkBox && checkBox.DataContext is ToDoTask task)
            {
                _todolist.ToggleTaskComplete(task.Id);
            }
        }

        //OnTextBlockMouseLeftButtonDown
        //hide the textBlock
        //show the text Box & save button
        //show the textBlock.Text in the text Box
        private void OnTextBlockMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (e.ClickCount == 2)
            {
                TextBlock textBlock = sender as TextBlock;
                StackPanel parent = textBlock.Parent as StackPanel;
                TextBox editTextBox = parent.FindName("editTaskDescription") as TextBox;
                Button btnSave = parent.FindName("btnSave") as Button;

                //hide the textBlock
                textBlock.Visibility = Visibility.Collapsed;
                //show the text Box & save button
                editTextBox.Visibility = Visibility.Visible;
                btnSave.Visibility = Visibility.Visible;
                //show the textBlock.Text in the text Box
                editTextBox.Text = textBlock.Text;

            }
        }

        //OnSaveEdit
        private void OnSaveEdit(object sender, RoutedEventArgs e)
        {
            Button btnSave = sender as Button;
            StackPanel parent = btnSave.Parent as StackPanel;
            TextBox editTextBox = parent.FindName("editTaskDescription") as TextBox;
            TextBlock textBlock = parent.FindName("txtTaskDescription") as TextBlock;
            ToDoTask task = textBlock.DataContext as ToDoTask;

            editTextBox.Visibility= Visibility.Collapsed;
            btnSave.Visibility= Visibility.Collapsed;
            textBlock.Visibility= Visibility.Visible;

            textBlock.Text = editTextBox.Text;
            _todolist.UpdateTask(task.Id,editTextBox.Text);
        }


        //OnAddTask
        private void OnAddTask(object sender, RoutedEventArgs e)
        {
            if(!string.IsNullOrWhiteSpace(txtNewTask.Text))
            {
                ToDoTask newTask=new ToDoTask(_todolist.Tasks.Count+1, txtNewTask.Text);
                _todolist.AddNewTask(newTask);
                txtNewTask.Clear();
            }
        }

    }
}
