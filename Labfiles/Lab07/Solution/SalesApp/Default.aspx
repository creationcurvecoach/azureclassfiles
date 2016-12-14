<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="SalesApp.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Sales Application</title>
    <style type="text/css">
        .auto-style1 {
            text-align: center;
        }
    </style>
</head>
<body>
    <form id="form1" runat="server" style="font-family: Arial; font-size: medium">
    <div>
    
    </div>
        <asp:SqlDataSource ID="sqlCustomers" runat="server" ConnectionString="<%$ ConnectionStrings:SalesConnectionString %>" SelectCommand="SELECT [CustomerID], [FirstName] + ' ' +  [LastName] As Name FROM [Customer]
ORDER BY LastName"></asp:SqlDataSource>
        <asp:SqlDataSource ID="sqlOrders" runat="server" ConnectionString="<%$ ConnectionStrings:SalesConnectionString %>" SelectCommand="SELECT [OrderID], [OrderDate], [OrderTotal] FROM [SalesOrder] WHERE ([CustomerID] = @CustomerID)">
            <SelectParameters>
                <asp:ControlParameter ControlID="DropDownList1" Name="CustomerID" PropertyName="SelectedValue" Type="Int32" />
            </SelectParameters>
        </asp:SqlDataSource>
        <h1 class="auto-style1">Customer Invoice History</h1>
        <div class="auto-style1">
        <asp:Label ID="Label1" runat="server" Text="Customer:"></asp:Label><asp:DropDownList ID="DropDownList1" runat="server" DataSourceID="sqlCustomers" DataTextField="Name" DataValueField="CustomerID" AutoPostBack="True">
        </asp:DropDownList>
        </div>
        <div align="center">
        <asp:GridView ID="GridView1" runat="server" AllowPaging="True" AutoGenerateColumns="False" CellPadding="4" DataKeyNames="OrderID" DataSourceID="sqlOrders" ForeColor="#333333" GridLines="None" style="text-align: left">
            <AlternatingRowStyle BackColor="White" />
            <Columns>
                <asp:BoundField DataField="OrderID" HeaderText="OrderID" InsertVisible="False" ReadOnly="True" SortExpression="OrderID" />
                <asp:BoundField DataField="OrderDate" HeaderText="OrderDate" SortExpression="OrderDate" DataFormatString="{0:dd-MMM-yyyy}" />
                <asp:BoundField DataField="OrderTotal" HeaderText="Invoice Amount" SortExpression="OrderTotal" DataFormatString="{0:#,##0.00}" />
            </Columns>
            <EditRowStyle BackColor="#2461BF" />
            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
            <HeaderStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
            <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" />
            <RowStyle BackColor="#EFF3FB" />
            <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
            <SortedAscendingCellStyle BackColor="#F5F7FB" />
            <SortedAscendingHeaderStyle BackColor="#6D95E1" />
            <SortedDescendingCellStyle BackColor="#E9EBEF" />
            <SortedDescendingHeaderStyle BackColor="#4870BE" />
        </asp:GridView>
            </div>
    </form>
</body>
</html>
