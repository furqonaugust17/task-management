import 'package:flutter/material.dart';
import 'package:frontend/pages/calendar.dart';
import 'package:frontend/pages/dashboard.dart';
import 'package:frontend/pages/profile.dart';
import 'package:frontend/pages/task.dart';
import 'package:frontend/widgets/button_navigation.dart';
import 'package:frontend/widgets/modal_insert.dart';

class Screen extends StatefulWidget {
  const Screen({super.key});

  @override
  State<Screen> createState() => _ScreenState();
}

class _ScreenState extends State<Screen> {
  final PageController pageController = PageController(initialPage: 0);
  late final List<Widget> pages = [
    Dashboard(onTap: () => _changePage(1)),
    Task(),
    Calendar(),
    Profile(),
  ];
  int _currentPage = 0;
  DateTime? selectedDate;

  void _changePage(int index) {
    setState(() {
      pageController.jumpToPage(index);
      _currentPage = index;
    });
  }

  @override
  void dispose() {
    pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        scrolledUnderElevation: 0.0,
        title: Row(
          children: [
            Icon(Icons.person, size: 40),
            Padding(
              padding: EdgeInsets.only(left: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Selamat Pagi', style: TextStyle(fontSize: 14)),
                  Text(
                    'Furqon August Seventeenth',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: PageView(
          controller: pageController,
          children: pages,
          onPageChanged: (value) => setState(() {
            _currentPage = value;
          }),
        ),
      ),
      extendBody: true,
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: FloatingActionButton(
        shape: CircleBorder(),
        backgroundColor: Colors.blue.shade500,
        onPressed: () {
          showModalBottomSheet(
            backgroundColor: Colors.white,
            context: context,
            builder: (context) => ModalInsert(
              onChanged: (DateTime? value) {
                selectedDate = value;
              },
            ),
          );
        },
        child: Icon(Icons.add, size: 40, color: Colors.white),
      ),
      bottomNavigationBar: BottomAppBar(
        shape: AutomaticNotchedShape(
          RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(20.0)),
          ),
          StadiumBorder(),
        ),
        notchMargin: 12,
        color: Colors.white,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: <Widget>[
            ButtonNavigation(
              icon: Icons.dashboard_outlined,
              title: 'Dashboard',
              currentPage: _currentPage,
              position: 0,
              onPress: () => _changePage(0),
            ),
            ButtonNavigation(
              icon: Icons.insert_drive_file_outlined,
              title: 'Tugas',
              currentPage: _currentPage,
              position: 1,
              onPress: () => _changePage(1),
            ),
            SizedBox(width: 48),
            ButtonNavigation(
              icon: Icons.calendar_month,
              title: 'Kalender',
              currentPage: _currentPage,
              position: 2,
              onPress: () => _changePage(2),
            ),
            ButtonNavigation(
              icon: Icons.person_outline,
              title: 'Profile',
              currentPage: _currentPage,
              position: 3,
              onPress: () => _changePage(3),
            ),
          ],
        ),
      ),
    );
  }
}
