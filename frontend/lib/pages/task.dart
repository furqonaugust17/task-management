import 'package:flutter/material.dart';

class Task extends StatelessWidget {
  const Task({super.key});

  @override
  Widget build(BuildContext context) {
    List<Map<String, String>> task=[
      {'title': 'Matematika', 'date': '20 Maret 2025', 'status': 'Segera'},
      {'title': 'Matematika', 'date': '20 Maret 2025', 'status': 'Belum Selesai'},
      {'title': 'Matematika', 'date': '20 Maret 2025', 'status': 'Selesai'},
      {'title': 'Matematika', 'date': '20 Maret 2025', 'status': 'segera'},
    ];
    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(10),

            // Search Menu
            child: TextField(
              decoration: InputDecoration(
                  hintText: "Cari...",
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: const Icon(Icons.calendar_month_rounded),
                  filled: true,
                  fillColor: Colors.grey[200],
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30),
                      borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(
                    vertical: 0,
                    horizontal: 20,
                  )),
            ),
          ),

          //enu Status
          SizedBox(width: 10),
          // --- MENU STATUS (HORIZONTAL) ---
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildMenuItem(
                      title: "Segera", color: Colors.blue, onTap: () {}),
                  const SizedBox(width: 10),
                  _buildMenuItem(
                      title: "Belum Selesai", color: Colors.blue, onTap: () {}),
                  const SizedBox(width: 10),
                  _buildMenuItem(
                      title: "Selesai", color: Colors.blue, onTap: () {}),
                ],
              ),
            ),
          ),

          SizedBox(
            width: 10,
          ),
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
                title: Text(task[index]['title']!,style: TextStyle(fontWeight: FontWeight.bold),),
                subtitle: Text(task[index]['date']!),
                trailing: TextButton(onPressed: () {}, 
                style: 
                TextButton.styleFrom(
                  backgroundColor: Colors.blue,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  ), child: Text(task[index]['status']!, style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white))),
              )
            ),
          ),
        )
        ],
      ),
    );
  }
}

Widget _buildMenuItem(
    {required String title,
    required Color color,
    required VoidCallback onTap}) {
  return GestureDetector(
    onTap: onTap,
    child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.blue.shade700,
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 4)),
          ],
          border: Border.all(
            color: Colors.grey.shade100,
          ),
        ),
        child: Text(
          title,
          style: const TextStyle(
              fontWeight: FontWeight.normal, fontSize: 16, color: Colors.white),
        )),
  );
}
