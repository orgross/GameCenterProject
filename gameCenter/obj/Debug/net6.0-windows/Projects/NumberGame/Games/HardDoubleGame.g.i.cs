﻿#pragma checksum "..\..\..\..\..\..\Projects\NumberGame\Games\HardDoubleGame.xaml" "{ff1816ec-aa5e-4d10-87f7-6f4963833460}" "C01D88409BE0801CB6496345B87C8FB568F153E1"
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Diagnostics;
using System.Windows;
using System.Windows.Automation;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Controls.Ribbon;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;
using System.Windows.Media.Media3D;
using System.Windows.Media.TextFormatting;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Windows.Shell;
using gameCenter.Projects.NumberGame.Games;


namespace gameCenter.Projects.NumberGame.Games {
    
    
    /// <summary>
    /// HardDoubleGame
    /// </summary>
    public partial class HardDoubleGame : System.Windows.Window, System.Windows.Markup.IComponentConnector {
        
        
        #line 11 "..\..\..\..\..\..\Projects\NumberGame\Games\HardDoubleGame.xaml"
        [System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1823:AvoidUnusedPrivateFields")]
        internal System.Windows.Controls.TextBlock Equation;
        
        #line default
        #line hidden
        
        
        #line 14 "..\..\..\..\..\..\Projects\NumberGame\Games\HardDoubleGame.xaml"
        [System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1823:AvoidUnusedPrivateFields")]
        internal System.Windows.Controls.TextBox Answer;
        
        #line default
        #line hidden
        
        
        #line 16 "..\..\..\..\..\..\Projects\NumberGame\Games\HardDoubleGame.xaml"
        [System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1823:AvoidUnusedPrivateFields")]
        internal System.Windows.Controls.Button CheckAnswer;
        
        #line default
        #line hidden
        
        
        #line 18 "..\..\..\..\..\..\Projects\NumberGame\Games\HardDoubleGame.xaml"
        [System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1823:AvoidUnusedPrivateFields")]
        internal System.Windows.Controls.TextBlock Response;
        
        #line default
        #line hidden
        
        private bool _contentLoaded;
        
        /// <summary>
        /// InitializeComponent
        /// </summary>
        [System.Diagnostics.DebuggerNonUserCodeAttribute()]
        [System.CodeDom.Compiler.GeneratedCodeAttribute("PresentationBuildTasks", "7.0.10.0")]
        public void InitializeComponent() {
            if (_contentLoaded) {
                return;
            }
            _contentLoaded = true;
            System.Uri resourceLocater = new System.Uri("/gameCenter;component/projects/numbergame/games/harddoublegame.xaml", System.UriKind.Relative);
            
            #line 1 "..\..\..\..\..\..\Projects\NumberGame\Games\HardDoubleGame.xaml"
            System.Windows.Application.LoadComponent(this, resourceLocater);
            
            #line default
            #line hidden
        }
        
        [System.Diagnostics.DebuggerNonUserCodeAttribute()]
        [System.CodeDom.Compiler.GeneratedCodeAttribute("PresentationBuildTasks", "7.0.10.0")]
        [System.ComponentModel.EditorBrowsableAttribute(System.ComponentModel.EditorBrowsableState.Never)]
        [System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Design", "CA1033:InterfaceMethodsShouldBeCallableByChildTypes")]
        [System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Maintainability", "CA1502:AvoidExcessiveComplexity")]
        [System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1800:DoNotCastUnnecessarily")]
        void System.Windows.Markup.IComponentConnector.Connect(int connectionId, object target) {
            switch (connectionId)
            {
            case 1:
            this.Equation = ((System.Windows.Controls.TextBlock)(target));
            return;
            case 2:
            this.Answer = ((System.Windows.Controls.TextBox)(target));
            return;
            case 3:
            this.CheckAnswer = ((System.Windows.Controls.Button)(target));
            
            #line 16 "..\..\..\..\..\..\Projects\NumberGame\Games\HardDoubleGame.xaml"
            this.CheckAnswer.Click += new System.Windows.RoutedEventHandler(this.CheckAnswer_Click);
            
            #line default
            #line hidden
            return;
            case 4:
            this.Response = ((System.Windows.Controls.TextBlock)(target));
            return;
            }
            this._contentLoaded = true;
        }
    }
}

