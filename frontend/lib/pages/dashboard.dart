import 'package:flutter/material.dart';
import 'package:frontend/widgets/card_task.dart';

class Dashboard extends StatelessWidget {
  final VoidCallback onTap;
  const Dashboard({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    List<Map<String, String>> task = [
      {'title': 'Matematika', 'date': '12 Maret 2025'},
      {'title': 'Matematika', 'date': '12 Maret 2025'},
      {'title': 'Matematika', 'date': '12 Maret 2025'},
      {'title': 'Matematika', 'date': '12 Maret 2025'},
    ];
    return Column(
      children: [
        Row(
          children: [
            CardTask(
              count: 10,
              status: "Segera Dikerjakan",
              color: Colors.red.shade600,
            ),
            CardTask(
              count: 10,
              status: "Belum Selesai",
              color: Colors.grey.shade600,
            ),
          ],
        ),
        Row(
          children: [
            CardTask(
              count: 10,
              status: "Telah Selesai",
              color: Colors.blue.shade700,
            ),
            CardTask(count: 40, status: "Total", color: Colors.blue.shade500),
          ],
        ),

        SizedBox(height: 20, width: double.infinity),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Kerjakan Segera",
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                  ),
                  GestureDetector(
                    onTap: onTap,
                    child: Text(
                      "Lihat Semua",
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.blue.shade500,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 10, width: double.infinity),
              SizedBox(
                height: 250,
                width: double.infinity,
                child: ListView.builder(
                  itemCount: task.length,
                  itemBuilder: (context, index) => Card(
                    shadowColor: Colors.transparent,
                    child: ListTile(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      tileColor: Colors.white,
                      title: Text(
                        task[index]['title']!,
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(task[index]['date']!),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
