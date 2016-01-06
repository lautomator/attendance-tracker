var attendanceTrackerApp = function(targets) {

    // model
    var data = {
        // default app data
        days: 12,
        students: [
            {
                name:   'default 1',
                attendance: []
            },
            {
                name:   'default 2',
                attendance: []
            },
            {
                name:   'default 3',
                attendance: []
            },
            {
                name:   'default 4',
                attendance: []
            },
            {
                name:   'default 5',
                attendance: []
            }
        ]
    };

    // controller
    var app = {
        getData: function() {
            // get the data from the model
            return data;
        },
        getRandom: function() {
            // returns true or false
            return (Math.random() >= 0.5);
        },
        createRecords: function() {
            // default records created when page is loaded
            var attendance = {},
                data = this.getData(),
                students = data.students,
                studentsLength = data.students.length,
                totalDays = data.days,
                index = 0,
                classes;

            // create a random matrix of days missed
            // based on the number of days from the data model
            while (index < studentsLength) {
                // push true or false values to each name array, resp.
                for (classes = 0; classes < totalDays; classes += 1) {

                    // for pushing random values to the array
                    // students[index].attendance.push(this.getRandom());

                    // the default state
                    students[index].attendance.push(false);
                }

                index += 1;
            }
        },
        attendanceCount: function(student) {
            // takes in the student index ->
            // returns the number of false values
            // from the attendance array
            var data = this.getData(),
                student = data.students[student],
                attendance = student.attendance,
                days = data.days,
                missed = 0,
                index = 0;

            // count the attendance for the student passed in
            while (index < days) {
                if (attendance[index] === false) {
                    missed += 1;
                }

                index += 1;
            }

            return missed;
        },
        setAttendance: function(student, session, value) {
            // updates the attendance array
            data.students[student].attendance[session] = value;
        },
        setDays: function(days) {
            // updates the days
            data.days = days;
        },
        setStudents: function(pupils) {
            // updates the names of the students
            var index = 0
                studentsLength = pupils.length;

            while (index < studentsLength) {
                data.students[index].name = pupils[index];
                index += 1;
            }
        },
        update: function(days, students) {
            var index = 0,
                index2 = 0,
                daysAdjust = 0,
                studentsLength = data.students.length;

            // add or delete days to the attendance matrix, if necessary
            if (days > data.days) {
                // get the difference
                daysAdjust = days - data.days;

                // traverse the students array
                while (index < studentsLength) {
                    // add more days to the matrix
                    while (index2 < daysAdjust) {
                        data.students[index].attendance.push(false);

                        index2 += 1;
                    }

                    index += 1;
                }
            }

            if (days < data.days) {
                // get the difference
                daysAdjust = data.days - days;

                // traverse the students array
                while (index < studentsLength) {
                    // remove days from the matrix
                    while (index2 < daysAdjust) {
                        data.students[index].attendance.pop();

                        index2 += 1;
                    }

                    index += 1;
                }
            }

            // set the updates
            this.setStudents(students);
            this.setDays(days);

            console.log(data.students[0].attendance.length);

        },
        init: function() {
            this.createRecords();
            view.init();
            adminView.init();
        }
    };

    // views
    var view = {
        context: function() {
            // get the data and templates
            var allData = app.getData(),
                context = {
                    days: allData.days,
                    students: allData.students,
                    headTemplate: targets.attendanceHeader,
                    headTemplateMobile: targets.attendanceHeaderMobile,
                    bodyTemplate: targets.attendanceStudent,
                    checkBoxes: targets.attendanceCheckBox
                };

            return context;
        },
        render: function() {
            var context = this.context(),
                totalDays = context.days,
                students = context.students,
                totalStudents = context.students.length,
                tableHead = $(context.headTemplate).html(),
                tableHeadMobile = $(context.headTemplateMobile).html(),
                tableBody = $(context.bodyTemplate).html(),
                checkBox = $(context.checkBoxes).html(),
                tableHeadHtml,
                tableBodyHtml,
                attendance,
                missed,
                missedUpdate,
                day = 1,
                index = 0,
                i, j;

            // build and render the template for the table header (cols)
            if ($(window).width() > 767) {
                while (day <= totalDays) {

                    // render the template header with the data
                    tableHeadHtml = tableHead.replace('%classNumber%', day);

                    $('#days-missed-header').before(tableHeadHtml);

                    day += 1;
                }
            } else {
                tableHeadHtml = tableHeadMobile.replace('%totalSessions%', totalDays);
                $('#days-missed-header').before(tableHeadHtml);
            }

            // build and render the template for the table body (rows)
            while (index < totalStudents) {
                missed = app.attendanceCount(index),
                attendance = students[index].attendance;

                // render the template body with the data
                tableBodyHtml = tableBody.replace('%studentName%',
                    students[index].name).replace('%missedNumber%',
                    missed).replace(/%studentId%/g, index);

                // render the name of the student,
                $('#table-content').append(tableBodyHtml);

                // render the class sessions checkboxes
                for (i = attendance.length - 1; i >= 0; i -= 1) {
                    // render the check boxes
                    if (attendance[i] === true) {
                        // a class was attended
                        $('.student-' + index).after(checkBox.replace('%status%',
                            'checked').replace('%studentId%',
                            index).replace('%session%', i));
                    } else {
                        // a class was missed
                        $('.student-' + index).after(checkBox.replace('%status%',
                         '').replace('%studentId%',
                            index).replace('%session%', i));
                    }
                }

                // listen for checkbox
                for (j = 0; j <= attendance.length; j += 1) {

                    // listen for check check box value
                    $('#' + index + '-' + j).click(function(index, j) {

                        // returns the id info of the button that was clicked
                        return function() {
                            selectedBox = $('#' + index + '-' + j);
                            if (selectedBox.is(':checked')) {
                                // the checkbox was checked
                                // update the records
                                app.setAttendance(index, j, true);
                                // update the view
                                $('#missed-' + index).text(app.attendanceCount(index));
                            } else {
                                // the checkbox was unchecked
                                // update the records
                                app.setAttendance(index, j, false);
                                // update the view
                                $('#missed-' + index).text(app.attendanceCount(index));
                            }
                        }
                    }(index, j));
                }

                index += 1;
            }
        },
        init: function() {
            this.render();
        }
    };

    var adminView = {
        context: function() {
            // get the data and template
            var allData = app.getData(),
                context = {
                    days: allData.days,
                    students: allData.students,
                    adminTemplate: targets.adminTemplate
                };

            return context;
        },
        render: function() {
            $('#attendance-admin-button').click(function() {

                var context = adminView.context(),
                    days = context.days,
                    students = context.students,
                    studentsLength = students.length,
                    template = $(context.adminTemplate).html(),
                    index = 0;

                // display the admin panel
                $('.attendance-admin-area').toggleClass('hidden');
                // clear any html incase the admin button is toggled
                $('#students-admin').html('');

                // pass in data
                $('#admin-sessions').attr('value', days);

                // render template with students
                while (index < studentsLength) {
                    $('#students-admin').append(template.replace('%name%',
                        students[index].name).replace('%index%', index));

                    index += 1;
                }
            });

        },
        update: function() {
            // update the data
            $('#admin-button-update').click(function() {
                var context = adminView.context(),
                    students = context.students,
                    studentsLength = students.length,
                    index = 0,
                    updates = {
                        days: 0,
                        students: []
                    };

                // get the data from the form:
                // get the days
                updates.days = $('#admin-sessions').val();

                while (index < studentsLength) {
                    updates.students[index] = $('#admin-student-' + index).val();
                    index += 1;
                }

                // refresh the app
                app.update(updates.days, updates.students);

                // close and clear the admin area
                adminView.hideForm();

                // remove the existing sessions
                $('.sessions').remove();
                // clear any existing html
                $('#table-content').html('');
                // remove any existing check boxes
                $('.checkbox').remove();

                view.init();

            });
        },
        cancel: function() {
            // cancel button is pressed
            $('#admin-button-cancel').click(function() {
                adminView.hideForm();
            });
        },
        hideForm: function() {
            $('.attendance-admin-area').toggleClass('hidden');

            // clear the form
            $('#students-admin').html('');
        },
        init: function() {
            this.render();
            this.cancel();
            this.update();
        }
    };

    app.init();

}; // udacityAttendanceApp app ends