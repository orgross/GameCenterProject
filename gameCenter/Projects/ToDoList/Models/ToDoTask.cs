using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace gameCenter.Projects.To_Do_List.Models
{
    internal class ToDoTask
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsCompleted { get; set; }

        public ToDoTask(int id, string description)
        {
            Id = id;
            Description = description;
            CreateDate = DateTime.Now;
            IsCompleted = false;
        }

   

   

    }
}
