Configuration IISInstall
{
    Node localhost
   {
	WindowsFeature IIS
        {
	    Name = "Web-Server"
	    Ensure = "Present"
        } 
    }
}