var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var _global = require('../global.js');
var mysql = require('mysql');
var pool = mysql.createPool(_global.db);
var async = require("async");
var pg = require('pg');
var format = require('pg-format');
const pool_postgres = new pg.Pool(_global.db_postgres);

//[name]
var insert_roles = [
    ['Student'],
    ['Teacher'],
    ['Staff'],
    ['Admin']
];

//[name, start_date, end_date, vacation_time]
var insert_semesters = [
    ['HK1 2015-2016', '2015-10-1 00:00:00', '2015-12-23 00:00:00', '24/12/2015 - 5/1/2016'], //1
    ['HK2 2015-2016', '2016-1-15 00:00:00', '2016-4-28 00:00:00', '30/4/2016 - 2/5/2016'],   //2
    ['HK3 2015-2016', '2016-5-5 00:00:00', '2016-8-8 00:00:00', '16/8/2016 - 25/9/2016'],     //3
    ['HK1 2016-2017', '2016-10-2 00:00:00', '2016-12-25 00:00:00', '24/12/2016 - 6/1/2017'],  //4
    ['HK2 2016-2017', '2017-1-16 00:00:00', '2017-5-2 00:00:00', '30/4/2017 - 2/5/2017'],    //5
    ['HK3 2016-2017', '2017-5-8 00:00:00', '2017-8-11 00:00:00', '16/8/2017 - 25/9/2017'],   //6
    ['HK1 2017-2018', '2017-10-2 00:00:00', '2017-12-25 00:00:00', '24/12/2017 - 6/1/2017'],  //7
    ['HK2 2017-2018', '2018-1-16 00:00:00', '2018-5-2 00:00:00', '30/4/2018 - 2/5/2018'],    //8
    ['HK3 2017-2018', '2018-5-8 00:00:00', '2018-8-11 00:00:00', '16/8/2018 - 25/9/2018'],   //9
    ['HK1 2018-2019', '2018-10-2 00:00:00', '2018-12-25 00:00:00', '24/12/2018 - 6/1/2018'],  //10
];

//[name,code]
var insert_programs = [
    ['Chính Quy', 'CTT'],
    ['Việt Pháp', 'VP'],
    ['Chất lượng cao', 'CLC'],
    ['Cử nhân tài năng', 'TN'],
    ['Chương trình tiên tiến', 'TT'],
];

//[code,email,program_id]
var insert_classes = [
    ['16CTT', '16ctt@student.hcmus.edu.vn', 1], //1
    ['15CTT', '15ctt@student.hcmus.edu.vn', 1], //2
    ['14CTT', '14ctt@student.hcmus.edu.vn', 1], //3
    ['13CTT', '13ctt@student.hcmus.edu.vn', 1], //4
    ['16VP', '16vp@student.hcmus.edu.vn', 2], //5
    ['15VP', '15vp@student.hcmus.edu.vn', 2], //6
    ['14VP', '14vp@student.hcmus.edu.vn', 2], //7
    ['13VP', '13vp@student.hcmus.edu.vn', 2], //8
    ['16CLC', '16clc@student.hcmus.edu.vn', 3], //9
    ['15CLC', '15clc@student.hcmus.edu.vn', 3], //10
    ['14CLC', '14clc@student.hcmus.edu.vn', 3], //11
    ['13CLC', '13clc@student.hcmus.edu.vn', 3], //12
    ['16TN', '16tn@student.hcmus.edu.vn', 4], //13
    ['15TN', '15tn@student.hcmus.edu.vn', 4], //14
    ['14TN', '14tn@student.hcmus.edu.vn', 4], //15
    ['13TN', '13tn@student.hcmus.edu.vn', 4], //16
    ['16TN', '16tt@student.hcmus.edu.vn', 5], //17
    ['15TT', '15tt@student.hcmus.edu.vn', 5], //18
    ['14TT', '14tt@student.hcmus.edu.vn', 5], //19
    ['13TT', '13tt@student.hcmus.edu.vn', 5], //20
];

//[code, name, semester_id, program_id, office_hour, note]
var insert_courses = [
    ['DEO251', 'Computational Biology and Chemistry', 10, 2, null, null],
    ['BXD572', 'Advances in Engineering Software', 10, 1, null, null],
    ['RPY307', 'Computers and Biomedical Research', 10, 1, null, null],
    ['VKLW825', 'Computer Languages', 10, 3, null, 'Sed ut perspiciatis'],
    ['BVX636', 'Computer Standards & Interfaces', 10, 3, null, null],
    ['DIPX607', 'Computer Aided Geometric Design', 10, 5, null, null],
    ['GUK125', 'Computational Geometry', 10, 5, null, null],
    ['HGV739', 'Computer Vision, Graphics, and Image Processing', 10, 2, null, null],
    ['CFG527', 'Computer Compacts', 10, 1, null, 'Sed ut perspiciatis'],
    ['SPI115', 'Applied Soft Computing', 10, 3, null, null],
    ['TDJXY828', 'Cognitive Systems Research', 10, 4, null, null],
    ['DTAPU640', 'Artificial Intelligence', 10, 2, null, null],
    ['TTYJ773', 'Computer Networks', 10, 4, null, null],
    ['YFO817', 'Biometric Technology Today', 10, 5, null, null],
    ['VFGP382', 'Artificial Intelligence in Medicine', 10, 5, null, 'Sed ut perspiciatis'],
    ['MWU251', 'Computer Networks (1976],', 10, 2, null, null],
    ['UPWF117', 'Computer Methods in Applied Mechanics and Engineering', 10, 3, null, null],
    ['NGU771', 'Advanced Engineering Informatics', 10, 5, null, 'Sed ut perspiciatis'],
    ['LJF488', 'Computer Programs in Biomedicine', 10, 5, null, 'Sed ut perspiciatis'],
    ['ISCGD902', 'Computer Speech & Language', 10, 1, null, null],
    ['SYSCA372', 'Computer Law & Security Report', 10, 2, null, null],
    ['CKOHH125', 'Computers & Chemistry', 10, 1, null, null],
    ['BBVTH758', 'Computer Methods and Programs in Biomedicine', 10, 1, null, null],
    ['KFLID866', 'Computational Statistics & Data Analysis', 10, 1, null, null],
    ['XWBV912', 'Computer Vision and Image Understanding', 10, 3, null, null],
    ['ILJX823', 'Computers and Standards', 10, 2, null, null],
    ['XYARK043', 'Artificial Intelligence in Engineering', 10, 2, null, null],
    ['POTYY911', 'Computer Physics Reports', 10, 4, null, null],
    ['OKU795', 'Computer Communications', 10, 3, null, 'Sed ut perspiciatis'],
    ['ZMX660', 'Computers & Urban Society', 10, 4, null, null],
    ['LBX450', 'Computers & Security', 10, 5, null, 'Sed ut perspiciatis'],
    ['MUQ436', 'Computers & Structures', 10, 4, null, 'Sed ut perspiciatis'],
    ['HTX111', 'Computer Languages, Systems & Structures', 10, 5, null, null],
    ['EKIEU541', 'Computerized Medical Imaging and Graphics', 10, 3, null, null],
    ['ITSYH813', 'Computer Networks and ISDN Systems', 10, 5, null, null],
    ['QHWQB333', 'Computer Fraud & Security', 10, 4, null, null],
    ['GKPT667', 'Ad Hoc Networks', 10, 2, null, null],
    ['PUM854', 'Computer Fraud & Security Bulletin', 10, 4, null, null],
    ['FOPI085', 'Computers in Biology and Medicine', 10, 2, null, null],
    ['OMWT331', 'Computers & Geosciences', 10, 1, null, null],
    ['TDO667', 'Computer Physics Communications', 10, 1, null, null],
    ['IVR855', 'AEU - International Journal of Electronics and Communications', 10, 4, null, null],
    ['XKNKO437', 'Computers and Geotechnics', 10, 5, null, 'Sed ut perspiciatis'],
    ['DJRQ310', 'Computer-Aided Design', 10, 4, null, null],
    ['RSR044', 'Cognitive Science', 10, 4, null, null],
    ['LFS755', 'Computers and Electronics in Agriculture', 10, 1, null, null],
    ['KUS664', 'Computer Graphics and Image Processing', 10, 3, null, null],
    ['BOC224', 'Card Technology Today', 10, 2, null, null],
    ['WMD836', 'Computers & Graphics', 10, 3, null, null],
    ['IXFM718', 'Computer Audit Update', 10, 3, null, null],
];

//[class_id,course_id,schedules]
var insert_class_has_course = [
    [1, 7, '10-I6-TH'],
    [1, 15, '19-E5-TH'],
    [1, 18, '3-B20-TH'],
    [1, 19, '16-I1-LT;13-B8-TH;14-B13-LT'],
    [1, 31, '4-F23-LT;2-F23-TH'],
    [1, 33, '12-F23-LT'],
    [1, 35, '1-F23-TH;19-C17-LT;3-E1-LT'],
    [1, 43, '9-C10-LT'],
    [2, 6, '3-B3-TH;1-B6-TH;5-E13-TH'],
    [2, 7, '1-F14-LT'],
    [2, 14, '7-B6-LT;3-E8-TH;2-E19-TH'],
    [2, 15, '12-B15-TH'],
    [2, 19, '7-I8-TH;9-B22-TH'],
    [2, 35, '6-B10-TH;7-I7-TH;19-I18-TH'],
    [2, 43, '6-E16-LT'],
    [3, 6, '21-C9-LT;3-B19-TH;14-E9-TH'],
    [3, 7, '2-C11-LT;16-B4-TH'],
    [3, 14, '0-B17-TH;21-E17-TH'],
    [3, 15, '19-F4-TH'],
    [3, 18, '12-F8-TH;17-C18-LT;20-B13-LT'],
    [3, 31, '1-B15-TH;19-B1-LT;7-F12-LT'],
    [3, 35, '0-F2-TH;16-F2-LT'],
    [3, 43, '12-B21-TH;16-I4-TH;0-I14-LT'],
    [4, 6, '17-I14-TH;10-F15-TH'],
    [4, 7, '19-B13-TH'],
    [4, 14, '19-I16-TH;19-C1-TH'],
    [4, 18, '8-E2-TH;1-B7-LT;21-F19-LT'],
    [4, 19, '3-E12-LT'],
    [4, 31, '17-B13-TH'],
    [4, 33, '11-I2-TH;3-B17-TH;19-E21-LT'],
    [4, 43, '17-B12-LT;16-C3-LT;0-I11-TH'],
    [5, 1, '9-E11-TH;13-F22-LT;9-C13-LT'],
    [5, 8, '10-E22-TH'],
    [5, 27, '5-I19-TH;1-F2-TH'],
    [5, 39, '15-B1-TH;15-C18-LT'],
    [6, 1, '2-I20-LT;1-I23-TH;14-I6-TH'],
    [6, 12, '12-E5-TH;21-B20-TH'],
    [6, 16, '21-I3-TH;9-B8-TH;16-F9-TH'],
    [6, 21, '9-E12-LT;17-E2-TH'],
    [6, 27, '16-E20-TH;1-I23-LT'],
    [6, 37, '5-I10-LT'],
    [6, 39, '16-C4-LT'],
    [6, 48, '12-B14-LT;19-B7-TH;14-F12-TH'],
    [7, 1, '15-E20-LT;9-B13-TH;16-C2-TH'],
    [7, 8, '0-F2-TH;6-I9-LT;7-I2-TH'],
    [7, 12, '19-F18-TH'],
    [7, 21, '4-I20-LT'],
    [7, 26, '2-C22-LT;3-E17-LT;10-I15-LT'],
    [7, 27, '11-E21-LT'],
    [7, 37, '11-C23-LT'],
    [7, 48, '8-C13-LT;7-B23-LT;2-B19-TH'],
    [8, 8, '14-I16-LT;1-F5-LT'],
    [8, 12, '11-I13-TH'],
    [8, 16, '10-B6-LT;2-E4-LT;2-C14-LT'],
    [8, 21, '1-F10-TH'],
    [8, 27, '8-B6-TH;8-C2-TH;9-B12-TH'],
    [8, 37, '0-I10-LT;2-E15-TH;11-F17-LT'],
    [8, 39, '6-F16-TH;18-I3-TH'],
    [9, 2, '10-B18-TH;2-I5-LT'],
    [9, 3, '3-F6-TH;14-F8-LT'],
    [9, 9, '1-F20-LT'],
    [9, 20, '21-B2-TH'],
    [9, 22, '5-E10-TH;8-E11-LT;4-F13-LT'],
    [9, 23, '13-B12-TH;2-C8-LT;11-F23-LT'],
    [9, 40, '9-E21-LT'],
    [9, 41, '17-I10-TH;4-B22-LT'],
    [9, 46, '0-B16-TH;9-E8-LT;11-E11-TH'],
    [10, 2, '5-E16-TH'],
    [10, 9, '7-I20-LT;12-B19-LT'],
    [10, 23, '20-I8-LT;1-F9-LT'],
    [10, 24, '9-C11-TH;3-I22-TH;8-C7-TH'],
    [10, 41, '10-F9-TH'],
    [10, 46, '7-B13-LT'],
    [11, 2, '14-I20-LT;17-B23-TH;20-C4-TH'],
    [11, 3, '9-I16-LT;15-I5-LT'],
    [11, 9, '8-I15-LT;10-F5-LT;9-I15-TH'],
    [11, 20, '21-C12-TH;8-F23-LT;8-I20-LT'],
    [11, 22, '3-B18-LT'],
    [11, 23, '18-E7-LT;5-B18-TH;14-E1-LT'],
    [11, 24, '19-I15-LT;3-E9-LT'],
    [11, 40, '19-F13-TH;11-C13-LT'],
    [11, 41, '15-C7-TH;17-B22-TH;15-I18-TH'],
    [12, 2, '11-F13-LT'],
    [12, 3, '4-F22-LT;15-B16-TH;14-B11-TH'],
    [12, 9, '20-E9-TH;1-F4-TH;5-I2-TH'],
    [12, 20, '11-I8-TH;1-B3-LT;11-C6-TH'],
    [12, 23, '13-C21-LT;2-B5-LT'],
    [12, 40, '11-I10-LT'],
    [12, 41, '18-F6-LT'],
    [13, 11, '10-I18-TH;0-I15-TH'],
    [13, 30, '20-F14-TH;14-C5-LT;19-E7-LT'],
    [13, 32, '4-B5-TH'],
    [13, 36, '8-F17-LT;10-F17-LT;13-I3-LT'],
    [13, 42, '12-E4-LT;14-F18-TH;2-F20-TH'],
    [13, 45, '14-C15-LT'],
    [14, 11, '10-B22-TH;18-B2-LT'],
    [14, 13, '20-E5-LT'],
    [14, 28, '10-E1-LT;9-B15-TH'],
    [14, 32, '16-I18-TH;12-F2-LT;5-C11-LT'],
    [14, 36, '0-E19-LT;15-B14-LT;3-I3-LT'],
    [14, 38, '19-C1-LT'],
    [14, 42, '13-I10-LT;12-F23-LT;2-C21-TH'],
    [14, 44, '5-E1-LT;10-C15-LT;20-F12-TH'],
    [14, 45, '5-I10-TH;0-B7-LT;0-I15-TH'],
    [15, 11, '1-C7-LT;21-F5-TH;3-F3-TH'],
    [15, 13, '4-B19-TH'],
    [15, 28, '6-F8-TH;18-B7-LT;8-B15-TH'],
    [15, 30, '21-B8-LT;18-B13-TH;19-F11-TH'],
    [15, 32, '21-B20-TH'],
    [15, 36, '8-C5-TH;6-F8-TH;1-F2-LT'],
    [15, 38, '8-E3-LT'],
    [15, 42, '10-C5-TH'],
    [15, 44, '4-I10-LT;4-I1-TH;18-I2-LT'],
    [16, 11, '12-C17-LT'],
    [16, 13, '12-I5-LT;10-B11-LT'],
    [16, 28, '4-I16-TH;15-F19-TH;12-I5-LT'],
    [16, 32, '2-B23-TH;0-F1-TH;18-I22-TH'],
    [16, 36, '3-B15-LT;19-B8-LT;12-F21-LT'],
    [16, 38, '2-I6-LT;21-C4-LT;2-I7-LT'],
    [16, 42, '20-B20-TH;9-E5-LT;3-C8-TH'],
    [16, 44, '0-I23-LT;6-C10-LT;13-E11-LT'],
    [17, 4, '3-E8-TH;19-E23-LT;17-F6-LT'],
    [17, 10, '2-F20-TH'],
    [17, 25, '10-F23-TH'],
    [17, 34, '7-F13-LT'],
    [17, 47, '11-C7-LT;17-C8-LT'],
    [17, 49, '4-B9-LT'],
    [17, 50, '0-B12-LT;18-B22-LT'],
    [18, 4, '11-E3-TH;8-B4-TH;2-F5-LT'],
    [18, 17, '9-F10-LT;18-B21-LT;15-I14-TH'],
    [18, 25, '16-B11-LT;19-B16-TH;0-E12-TH'],
    [18, 29, '10-C6-LT;7-I5-LT;8-F13-TH'],
    [18, 34, '16-C10-TH;12-F10-LT;0-C14-TH'],
    [18, 47, '9-B15-LT;5-E14-TH;3-B13-TH'],
    [18, 49, '15-B13-LT;18-E17-LT;8-E16-TH'],
    [18, 50, '18-I3-TH;14-E15-LT;1-I6-TH'],
    [19, 10, '8-I15-TH'],
    [19, 17, '14-F3-TH'],
    [19, 25, '0-F19-LT;18-I12-LT;6-E12-LT'],
    [19, 29, '16-B19-LT;7-I23-TH;16-F1-TH'],
    [19, 34, '13-E9-LT;10-F17-TH'],
    [19, 49, '15-E23-LT;17-I4-LT'],
    [19, 50, '6-I5-TH'],
    [20, 5, '11-F10-TH'],
    [20, 10, '8-E15-TH;2-B3-LT;0-E15-TH'],
    [20, 17, '5-I15-LT;9-F23-LT;6-E19-TH'],
    [20, 47, '0-E14-TH;12-F23-TH;13-I4-LT'],
    [20, 50, '10-C19-TH'],
];

//[first_name,last_name,email,phone,password,role_id]
var insert_users = [
    ['Đinh Bá', 'Tiến', 'dbtien@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Hữu', 'Anh', 'nhanh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Hữu', 'Nhã', 'nhnha@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Ngọc', 'Thu', 'nnthu@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Văn', 'Hùng', 'nvhung@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trần Minh', 'Triết', 'tmtriet@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Phạm Hoàng', 'Uyên', 'phuyen@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Phúc', 'Sơn', 'npson@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Ngô Tuấn', 'Phương', 'ntphuong@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Tuấn', 'Nam', 'ntnam@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Thanh', 'Phương', 'ntphuong1@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trần Trung', 'Dũng', 'ttdung@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trần Thái', 'Sơn', 'ttson@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Ngô Đức', 'Thành', 'ndthanh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Dương Nguyên', 'Vũ', 'dnvu@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Lâm Quang', 'Vũ', 'lqvu@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Hồ Tuấn', 'Thanh', 'htthanh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trương Phước', 'Lộc', 'tploc@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Hữu Trí', 'Nhật', 'nhtnhat@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Duy Hoàng', 'Minh', 'ndhminh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Lương Vĩ', 'Minh', 'lvminh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Vinh', 'Tiệp', 'nvtiep@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Phạm Việt', 'Khôi', 'pvkhoi@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Văn', 'Thìn', 'nvthin@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Thị Thanh', 'Huyền', 'ntthuyen@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Vũ Quốc', 'Hoàng', 'vqhoang@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Lê Quốc', 'Hòa', 'lqhoa@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Chung Thùy', 'Linh', 'ctlinh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Lê Yên', 'Thanh', 'lythanh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Võ Hoài', 'Việt', 'vhviet@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Phạm Thanh', 'Tùng', 'pttung@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Đức', 'Huy', 'ndhuy@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Khắc', 'Huy', 'nkhuy@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trần Duy', 'Quang', 'tdquang@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trần Ngọc Đạt', 'Thành', 'tndthanh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Lê Minh', 'Quốc', 'lmquoc@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Phạm Đức', 'Thịnh', 'pdthinh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Bùi Quốc', 'Minh', 'bqminh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Võ Duy', 'Anh', 'vdanh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trần Thị Bích', 'Hạnh', 'ttbhanh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trương Phước', 'Lộc', 'tploc@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trần Duy', 'Quang', 'tdquang@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Tuấn Nguyên Đức', 'Hoài', 'tndhoai@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trần Hoàng', 'Khanh', 'thkhanh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Lê Thị', 'Nhàn', 'ltnhan@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Thị Thu', 'Vân', 'nttvan@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Thanh', 'Trọng', 'nttrong@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Phạm Tuấn', 'Sơn', 'ptson@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Đỗ Hoàng', 'Cường', 'dhcuong@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Quản Thị Nguyệt', 'Thơ', 'qtntho@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Trần Minh', 'Thư', 'ntmthu@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Đặng Bình', 'Phương', 'dbphuong@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Cao Thị Thùy', 'Liên', 'cttlien@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Trần Xuân Thiên', 'An', 'txtan@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Ngô Chánh', 'Đức', 'ncduc@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Lê Văn', 'Chánh', 'lvchanh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Huỳnh Ngọc', 'Chương', 'hnchuong@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Thanh Quản', 'Quản', 'ntquan@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Lê Viết', 'Long', 'lvlong@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Nguyễn Thành', 'Long', 'ntlong@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Lê Nguyễn Hoài', 'Nam', 'lnhnam@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
    ['Bùi Đắc', 'Thịnh', 'bdthinh@fit.hcmus.edu.vn', '090xxxx', bcrypt.hashSync('1512529', 10), 2],
];

//[student_id, reason, start_date, end_date]
var insert_absence_requests = [
    [63, 'Đi khám nghĩa vụ quân sự', '2017-05-31 00:00:00', '2017-06-01 00:00:00'],
    [63, 'Đi thi ACM', '2017-06-03 00:00:00', '2017-06-10 00:00:00'],
];


//[from_id, to_id, title, content, category, type, read, replied]
var insert_feeback = [
    [null, null, 'Phòng học kém chất lượng', 'Máy lạnh nóng quớ', 2, 3, false, false],//1
    [171, 1, 'Thầy dạy quá nhanh', 'Thầy có thể dạy chậm lại cho em dễ hiểu ?', 1, 1, false, false],//2
    [171, null, 'Ổ điện hỏng', 'Ổ điện dãy giữa phòng I44 bị hỏng', 2, 1, true, true],//3
    [171, null, 'Lớp 13CLC hư', 'Lớp 13CLC nói chuyện quá nhiều trong giờ', 1, 1, true, true],//4
    [null, null, 'Phòng học chất lượng thấp', 'Khong co may lanh', 2, 3, false, false],//5
    [171, 1, 'Thầy dạy quá khó hiểu', 'Thầy có thể dạy chậm lại cho em dễ hiểu ?', 1, 1, false, false],//6
    [171, 2, 'Cô hay đến lớp trễ', 'Tóc mới của cô làm em khó tập trung quá!', 1, 1, false, false],//7
    [1, null, 'Ổ điện không mở được', 'Cô hãy fix giúp tụi em', 2, 1, true, true],//8
    [1, null, 'Lớp 13CLC cúp học cả lớp', 'Lớp 13CLC nói chuyện quá ', 1, 1, true, true]//9
];

//[title, class_has_course_id, created_by,is_template]
var insert_quiz = [
    ['KTLT tuần 1', 20, 1, 1], //1
];

//[quiz_id, text, option_a, option_b, option_c, option_d, correct_option, timer]
var insert_quiz_question = [
    [1, `Kiểu nào có kích thước lớn nhất`, 'int', 'char', 'long', 'double', 'double', 10], //1
    [1, `Dạng hậu tố của biểu thức 9 - (5 + 2) là ?`, '95-+2', '95-2+', '952+-', '95+2-', '952+-', 10], //2
    [1, `Giả sử a và b là hai số thực. Biểu thức nào dưới đây là không được phép theo cú pháp của ngôn ngữ lập trình C?`, 'ab', 'a-=b', 'a>>=b', 'a*=b', 'a>>=b', 10],//3
];

//[quiz_question_id, selected_option, answered_by]
var insert_quiz_answer = [
    [1, `C`, 114], //1
    [1, `D`, 115], //2
    [2, `B`, 114], //3
    [2, `C`, 115], //4
    [3, `C`, 116], //3
    [3, `A`, 117], //4
];

//[to_id, message, object_id, type]
var insert_notifications = [
    [null, 1, `Đinh Bá Tiến sent you a feedback`, 5, _global.notification_type.sent_feedback], //1
];

var seeding_postgres = function (res) {
    pool_postgres.connect(function (error, connection, done) {
        async.series([
            //Start transaction
            function (callback) {
                connection.query('BEGIN', (error) => {
                    if (error) callback(error);
                    else callback();
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO roles (name) VALUES %L', insert_roles), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO semesters (name,start_date,end_date,vacation_time) VALUES %L', insert_semesters), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO programs (name,code) VALUES %L', insert_programs), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO classes (name,email,program_id) VALUES %L', insert_classes), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO courses (code,name,semester_id,program_id,office_hour,note) VALUES %L', insert_courses), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO class_has_course (class_id,course_id,schedules) VALUES %L', insert_class_has_course), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO users (first_name,last_name,email,phone,password,role_id) VALUES %L', insert_users), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO absence_requests (student_id, reason, start_date, end_date) VALUES %L', insert_absence_requests), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO feedbacks (from_id, to_id, title, content, category, type, read, replied) VALUES %L', insert_feeback), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO quiz (title, class_has_course_id, created_by, is_template) VALUES %L', insert_quiz), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO quiz_questions (quiz_id, text, option_a, option_b, option_c, option_d, correct_option, timer) VALUES %L', insert_quiz_question), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO quiz_answers (quiz_question_id, selected_option ,answered_by) VALUES %L', insert_quiz_answer), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO notifications (to_id,from_id, message ,object_id, type) VALUES %L', insert_notifications), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //Commit transaction
            function (callback) {
                connection.query('COMMIT', (error) => {
                    if (error) callback(error);
                    else callback();
                });
            },
        ], function (error) {
            if (error) {
                _global.sendError(res, error.message);
                connection.query('ROLLBACK', (error) => {
                    if (error) return console.log(error);
                });
                done(error);
                return console.log(error);
            } else {
                console.log('success seeding!---------------------------------------');
                res.send({ result: 'success', message: 'success seeding' });
                done();
            }
        });
    });
};

var insert_admin = [
    ['Nguyễn Hữu', 'Thân', 'huuthan@gmail.com', '0357409117', bcrypt.hashSync('huuthan', 10), 4], //1
];

var seeding_admin = function (res) {
    pool_postgres.connect(function (error, connection, done) {
        async.series([
            //Start transaction
            function (callback) {
                connection.query('BEGIN', (error) => {
                    if (error) callback(error);
                    else callback();
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO roles (name) VALUES %L', insert_roles), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                connection.query(format('INSERT INTO users (first_name,last_name,email,phone,password,role_id) VALUES %L', insert_admin), function (error, results, fields) {
                    if (error) {
                        callback(error);
                    } else {
                        callback();
                    }
                });
            },
            //Commit transaction
            function (callback) {
                connection.query('COMMIT', (error) => {
                    if (error) callback(error);
                    else callback();
                });
            },
        ], function (error) {
            if (error) {
                _global.sendError(res, error.message);
                connection.query('ROLLBACK', (error) => {
                    if (error) return console.log(error);
                });
                done(error);
                return console.log(error);
            } else {
                console.log('success seeding!---------------------------------------');
                res.send({ result: 'success', message: 'success seeding' });
                done();
            }
        });
    });
}
router.get('/', function (req, res, next) {
    //seeding_mysql(res);
    seeding_postgres(res);
});
router.get('/admin', function (req, res, next) {
    //seeding_mysql(res);
    seeding_admin(res);
});
module.exports = router;
