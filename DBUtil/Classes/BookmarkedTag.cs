using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DBUtil
{
    public class BookmarkedTag
    {
        public string UserID;
        public MediaTag Tag;

        public BookmarkedTag()
        {
            Tag = new MediaTag();
        }
    }
}
