import 'package:flutter/material.dart';

class ButtonNavigation extends StatelessWidget {
  final String title;
  final IconData icon;
  final int currentPage;
  final int position;
  final VoidCallback onPress;
  const ButtonNavigation({
    super.key,
    required this.title,
    required this.icon,
    required this.currentPage,
    required this.position,
    required this.onPress,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: IconButton(
            icon: Icon(
              icon,
              color: currentPage == position
                  ? Colors.blue.shade500
                  : Color(0xFF5E5E5E),
              size: 33,
            ),
            onPressed: onPress,
          ),
        ),
        Text(
          title,
          style: TextStyle(
            fontSize: 10,
            color: currentPage == position
                ? Colors.blue.shade500
                : Color(0xFF5E5E5E),
          ),
        ),
      ],
    );
  }
}
