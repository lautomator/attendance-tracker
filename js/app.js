var attendanceTrackerApp = function(targets) {

    // model
    var data = {
        // app data
        days: 12,
        students: [
            {
                name:   'student 1',
                attendance: []
            },
            {
                name:   'student 2',
                attendance: []
            },
            {
                name:   'student 3',
                attendance: []
            },
            {
                name:   'student 4',
                attendance: []
            },
            {
                name:   'student 5',
                attendance: []
            }
        ],
        setAttendance: function(student, session, value) {
            // updates the attendance array
            data.students[student].attendance[session] = value;
        },
        setDays: function(days) {
            // updates the days
            data.days = days;
        },
        setStudents: function(students) {
            // updates the names of the students
            var index = 0
                studentsLength = students.length;

            while (index < studentsLength) {
                data.students[index].name = students[index];
                index += 1;
            }
        }
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
                    students[index].attendance.push(this.getRandom());
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
        attendanceUpdate: function(student, button, value) {
            // updates the attendance array
            // for the selected student, button,
            // and value (checked or unchecked)

            // update the data
            data.setAttendance(student, button, value);
        },
        adminUpdate: function(updates) {
            // parses the updates object and
            // send them back to the data model
            var days = updates.days,
                students = updates.students;

            data.setDays(days);

            data.setStudents(students);
        },
        init: function() {
            // create some records
            this.createRecords();

            // render the view layer
            view.init();

            // render the admin view
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

                // render the class sessions checkboxes,
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
                                app.attendanceUpdate(index, j, true);
                                // update the view
                                $('#missed-' + index).text(app.attendanceCount(index));
                            } else {
                                // the checkbox was unchecked
                                // update the records
                                app.attendanceUpdate(index, j, false);
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
            // render the view
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
            var context = this.context(),
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

        },
        update: function() {
            var context = this.context(),
                students = context.students,
                studentsLength = students.length,
                index = 0,
                updates = {
                    days: 0,
                    students: []
                };

            // update the data
            $('#admin-button-update').click(function() {
                // get the data from the form

                // get the days
                updates.days = $('#admin-sessions').val();

                while (index < studentsLength) {
                    updates.students[index] = $('#admin-student-' + index).val();
                    index += 1;
                }

                // set the updates
                app.adminUpdate(updates);

                // close and clear the admin area
                adminView.clearForm();

                // re render
                $('.student').html('');
                $('.attend-col').html('');

                view.init();

                console.log(data);
            });
        },
        cancel: function() {
            // cancel button is pressed
            $('#admin-button-cancel').click(function() {
                adminView.clearForm();
            });
        },
        clearForm: function() {
            $('.attendance-admin-area').toggleClass('hidden');

            // clear the form
            $('#students-admin').html('');
        },
        init: function() {
            $('#attendance-admin-button').click(function() {
                adminView.render();
            });
            this.cancel();
            this.update();
        }
    };

    app.init();

}; // udacityAttendanceApp app ends