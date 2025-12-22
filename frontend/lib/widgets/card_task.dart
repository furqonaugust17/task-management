import 'package:flutter/material.dart';

class CardTask extends StatelessWidget {
  final int count;
  final String status;
  final Color color;
  const CardTask({
    super.key,
    required this.count,
    required this.status,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: SizedBox(
        height: 180,
        child: Card(
          margin: EdgeInsets.all(10),
          color: color,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      count.toString(),
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 60,
                        height: .7,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 5),
                      child: Text(
                        "Tugas",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          height: 1,
                        ),
                      ),
                    ),
                  ],
                ),
                Text(
                  status,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
