using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

namespace DemoClientApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Retrieving data values...");
            try
            {
                string connStr = ConfigurationManager.ConnectionStrings["demoConnectionString"].ConnectionString;
                using (SqlConnection conn = new SqlConnection(connStr))
                {
                    conn.Open();
                    SqlCommand cmd = conn.CreateCommand();
                    cmd.CommandType = CommandType.Text;
                    cmd.CommandText = "SELECT * FROM dbo.demotable";
                    SqlDataReader dr = cmd.ExecuteReader();
                    while (dr.Read())
                    {
                        Console.WriteLine(dr[1]);
                    }
                }
                
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine(ex.Message);
                Console.ResetColor();
            }
            finally
            {
                Console.WriteLine("Press a key to end...");
                Console.Read();
            }
        }
    }
}
