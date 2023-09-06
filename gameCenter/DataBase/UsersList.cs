using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace gameCenter.DataBase
{
    class UsersList
    {
        public List<User> Users = new List<User>();

        public UsersList()
        {
            Users.Add(new User { Username = "Or", Password = "123", IsLoggedIn = false, Points = new List<int> { 0 } });
            Users.Add(new User { Username = "Matan", Password = "123", IsLoggedIn = false, Points = new List<int> { 0 } });
            Users.Add(new User { Username = "Gal", Password = "123", IsLoggedIn = false, Points = new List<int> { 0 } });
            Users.Add(new User { Username = "Eilon", Password = "123", IsLoggedIn = false, Points = new List<int> { 0 } });
            Users.Add(new User { Username = "Shiran", Password = "123", IsLoggedIn = false, Points = new List<int> { 0 } });
            Users.Add(new User { Username = "[]", Password = "[]", IsLoggedIn = false, Points = new List<int> { 0 } });
        }

        public User LogIn(string usernameInput, string passwordInput, TextBlock outputTextBlock)
        {
            string name = usernameInput;
            string passW = passwordInput;

            foreach (User user in Users)
            {
                if (name == user.Username && passW == user.Password)
                {
                    if (!user.IsLoggedIn)
                    {
                        user.IsLoggedIn = true;
                        MessageBox.Show("Welcome, " + user.Username + "\n");
                        return user;
                    }
                    else
                    {
                        MessageBox.Show(user.Username + ", you were already logged in\n");
                        return user;
                    }
                }
                else if (name != user.Username || passW != user.Password)
                {
                    MessageBox.Show("Wrong username or password\n");
                }
            }
            while (true)
            {
                MessageBoxResult result = MessageBox.Show("Are you sure you want to create a new user?", "Confirmation", MessageBoxButton.YesNoCancel);
                if (result == MessageBoxResult.Yes)
                {
                    User newUser = NewUser(name, passW);
                    return newUser;
                }
                else if (result == MessageBoxResult.No)
                {
                    User newUser = LogIn(name, passW, outputTextBlock);
                    return newUser;
                }
                else if (result == MessageBoxResult.Cancel)
                {
                    MessageBox.Show("You cancel your registeration");
                }
                else
                {
                    MessageBox.Show("System error");
                }
            }
        }

        public User NewUser(string username, string password)
        {
            User newUser = new User
            {
                Username = username,
                Password = password,
                IsLoggedIn = true,
                Points = new List<int> { 0 }
            };
            Users.Add(newUser);
            MessageBox.Show("Welcome, " + newUser.Username + " (new user)");
            return newUser;
        }
    }

}

