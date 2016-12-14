using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AdatumWebsite.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "A. Datum - always at the cutting edge.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Responsive, communicative, approachable.";

            return View();
        }
    }
}