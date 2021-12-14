using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class TagUser
    {
        public string UserID;
        public long? TagID;
        public string MediaID;
        public PageType PageType;

        public TagUser() {
            PageType = PageType.Useless;
        }
    }
}
